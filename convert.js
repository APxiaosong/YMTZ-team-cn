/**
 * JSON to JS Converter (with auto-fix)
 *
 * Features:
 * - Auto-fix unescaped ASCII quotes in Chinese text
 * - Auto-fix quotes in note/comment fields written by AI
 * - Correctly pairs left " and right " quotes
 * - Generate JS module for local file:// access
 *
 * Usage: node convert.js
 *        or double-click convert-json-to-js.bat
 */
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const jsonPath = path.join(rootDir, 'data', 'products.json');
const jsPath = path.join(rootDir, 'js', 'products-data.js');

const LEFT_QUOTE = '\u201C';   // "
const RIGHT_QUOTE = '\u201D';  // "

// Characters that can surround quotes in Chinese text
const CJK_PATTERN = '[\\u4e00-\\u9fff\\u3000-\\u303F\\uFF00-\\uFFEF\\u2014\\u2013]';

// Extended pattern: CJK chars + common punctuation + spaces + digits
const EXTENDED_PATTERN = '[\\u4e00-\\u9fff\\u3000-\\u303F\\uFF00-\\uFFEF\\u2014\\u2013\\s,.!?;:()（）、。！？；：，0-9]';

/**
 * 修复中文文本中的 ASCII 双引号为中文引号
 * 匹配模式：CJK字符 + " + 内容（不含换行，且长度>1） + " + CJK字符
 * 要求引号内容至少2个字符，避免误伤单字的 JSON 值如 "鼬"
 */
function fixQuotes(content) {
    // [^"\n]{2,} 确保内容不跨行且至少2个字符
    const regex = new RegExp(`(${CJK_PATTERN})"([^"\\n]{2,})"(${CJK_PATTERN})`, 'g');

    let result = content;
    let prev;

    do {
        prev = result;
        result = result.replace(regex, `$1${LEFT_QUOTE}$2${RIGHT_QUOTE}$3`);
    } while (result !== prev);

    return result;
}

/**
 * 修复备注字段中的引号
 * 专门处理 "notes": "..." 字段内的未转义双引号
 *
 * 策略：利用 JSON 格式化后的换行特征
 * notes 字段值从 `"notes": "` 开始，到行尾的 `"` 或 `",` 结束
 */
function fixNotesQuotes(content) {
    // 匹配整行的 notes 字段（从 "notes": " 到行尾）
    // 使用多行模式，$ 匹配行尾
    return content.replace(
        /^(\s*"notes"\s*:\s*")(.+)("(?:,)?)\s*$/gm,
        (match, prefix, value, suffix) => {
            // 在 value 内部修复成对的双引号
            let fixedValue = value;
            let prev;
            do {
                prev = fixedValue;
                // 匹配：任意字符 + " + 内容 + " + 任意字符
                // 但内容不能是空的，且前后不能是反斜杠
                fixedValue = fixedValue.replace(
                    /([^\\])"([^"]+)"(?=[^$])/g,
                    `$1${LEFT_QUOTE}$2${RIGHT_QUOTE}`
                );
            } while (fixedValue !== prev);

            return prefix + fixedValue + suffix;
        }
    );
}

/**
 * 修复长文本字段中的引号（summary, full, tagline 等）
 * 这些字段通常包含中文描述，可能有 AI 写入的双引号
 */
function fixLongTextQuotes(content) {
    const longTextFields = ['summary', 'full', 'tagline', 'quote', 'content', 'text'];
    let result = content;

    for (const field of longTextFields) {
        const regex = new RegExp(`("${field}"\\s*:\\s*")([^"]*(?:"[^"]*)*?)(")`, 'g');
        result = result.replace(regex, (match, prefix, value, suffix) => {
            // 在 value 内部修复引号
            let fixedValue = value;
            let prev;
            do {
                prev = fixedValue;
                // 匹配中文环境中的双引号
                fixedValue = fixedValue.replace(
                    /([\u4e00-\u9fff\u3000-\u303F0-9])"([^"]+)"([\u4e00-\u9fff\u3000-\u303F0-9])/g,
                    `$1${LEFT_QUOTE}$2${RIGHT_QUOTE}$3`
                );
            } while (fixedValue !== prev);

            return prefix + fixedValue + suffix;
        });
    }

    return result;
}

/**
 * 综合修复函数：依次应用所有修复策略
 */
function fixAllQuotes(content) {
    let result = content;

    // 1. 修复严格匹配的 CJK 引号（通用）
    result = fixQuotes(result);

    // 2. 修复 notes 字段中的引号
    result = fixNotesQuotes(result);

    // 3. 修复其他长文本字段中的引号
    result = fixLongTextQuotes(result);

    return result;
}

try {
    console.log('Reading products.json...');
    let content = fs.readFileSync(jsonPath, 'utf8');

    // Fix quotes (using comprehensive fix function)
    const fixed = fixAllQuotes(content);
    const hadFixes = fixed !== content;

    // Parse and validate
    const data = JSON.parse(fixed);
    console.log(`Loaded ${data.length} products`);

    if (hadFixes) {
        // Save fixed JSON
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        console.log('Fixed quote issues in products.json');
    }

    // Generate JS module
    const jsContent = `/** Auto-generated from products.json - do not edit */\nconst PRODUCTS_DATA = ${JSON.stringify(data, null, 2)};\n`;
    fs.writeFileSync(jsPath, jsContent, 'utf8');
    console.log('Generated js/products-data.js');

    console.log('\nDone! You can now open HTML files directly.');

} catch (err) {
    console.error('\nError:', err.message);

    if (err.message.includes('position')) {
        const content = fs.readFileSync(jsonPath, 'utf8');
        const match = err.message.match(/line (\d+)/);
        if (match) {
            const lineNum = parseInt(match[1]);
            const lines = content.split('\n');
            console.log(`\nProblem at line ${lineNum}:`);
            console.log(lines[lineNum - 1]?.slice(0, 100));
        }
    }

    process.exit(1);
}
