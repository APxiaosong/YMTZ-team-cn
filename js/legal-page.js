/**
 * 法律与合规页面逻辑
 * 处理隐私协议、使用条款、安全合规三个文档的展示
 */

(function() {
    'use strict';

    // ============================================
    // 配置常量
    // ============================================
    const DEFAULT_SECTION = 'privacy';

    // ============================================
    // 法律文档数据
    // ============================================
    const LEGAL_DATA = {
        // ----------------------------------------
        // 隐私协议
        // ----------------------------------------
        privacy: {
            id: 'privacy',
            title: '隐私协议',
            subtitle: 'Privacy Policy',
            icon: 'shield_lock',
            lastUpdated: '2042年1月15日',
            quote: {
                text: '在监狱，我们保守两种秘密：关于我们子嗣的，和关于信任我们的人的。',
                author: '典狱长'
            },
            intro: '在监狱重工，我们将每一台产品视为自己的子嗣，同样，我们也以相同的责任感对待每一位用户的信息。本协议详细说明了我们如何收集、使用和保护您的数据。我们承诺：每一个字节的数据都会得到应有的尊重与保护。',
            sections: [
                {
                    id: 'intelligence-gathering',
                    heading: '情报采集',
                    headingEn: 'Intelligence Gathering',
                    content: '当您访问监狱重工的数字领地时，我们可能会收集以下类型的信息：',
                    items: [
                        '访问日志：包括您的IP地址、浏览器类型、访问时间等技术数据',
                        '设备信息：操作系统、屏幕分辨率、设备标识符',
                        '交互数据：页面浏览记录、停留时长、点击行为',
                        '通讯内容：当您通过加密频段联络我们时提交的信息'
                    ],
                    note: '我们不会主动收集您的真实身份信息，除非您自愿提供。'
                },
                {
                    id: 'operational-use',
                    heading: '任务用途',
                    headingEn: 'Operational Use',
                    content: '您的数据在我们的系统中享有与军事机密同等的保护级别。我们仅将收集的信息用于以下用途：',
                    items: [
                        '优化网站体验，确保系统稳定运行',
                        '分析访问模式，改进产品展示效果',
                        '响应您的联络请求，提供技术支持',
                        '安全监控，防范恶意访问与攻击'
                    ]
                },
                {
                    id: 'intelligence-sharing',
                    heading: '情报共享协议',
                    headingEn: 'Intelligence Sharing',
                    content: '我们不出售情报，过去不会，将来也不会。',
                    items: [
                        '我们不会将您的个人信息出售给任何第三方',
                        '仅在法律明确要求时，我们才会向执法机构披露必要信息',
                        '我们可能使用第三方分析服务，但这些服务受到严格的保密协议约束'
                    ]
                },
                {
                    id: 'security-level',
                    heading: '防护等级',
                    headingEn: 'Security Level',
                    content: '我们采用多层防护体系保障您的数据安全：',
                    items: [
                        'SSL/TLS加密传输：所有数据传输均采用端到端加密',
                        '访问控制：严格的权限分级制度',
                        '定期审计：系统安全性接受持续监控与评估',
                        '备份机制：数据定期备份，确保灾难恢复能力'
                    ]
                },
                {
                    id: 'your-clearance',
                    heading: '您的授权',
                    headingEn: 'Your Clearance',
                    content: '作为数据主体，您拥有以下权利：',
                    items: [
                        '访问权：您可以请求查看我们持有的关于您的信息',
                        '更正权：您可以要求更正不准确的信息',
                        '删除权：在特定情况下，您可以要求删除您的数据',
                        '反对权：您可以反对我们处理您数据的特定方式'
                    ],
                    note: '如需行使上述权利，请通过加密频段联络我们的数据保护官。'
                },
                {
                    id: 'tracking-protocol',
                    heading: '追踪协议',
                    headingEn: 'Tracking Protocol',
                    content: '本站使用Cookie和类似技术来改善您的浏览体验。这些小型数据文件帮助我们：',
                    items: [
                        '记住您的偏好设置',
                        '分析网站流量和使用模式',
                        '提供更相关的内容展示'
                    ],
                    note: '您可以通过浏览器设置管理或禁用Cookie，但这可能影响部分功能的正常使用。'
                },
                {
                    id: 'encrypted-channel',
                    heading: '加密频段',
                    headingEn: 'Encrypted Channel',
                    content: '如您对本隐私协议有任何疑问，或希望行使您的数据权利，请通过以下方式联系我们：',
                    items: [
                        '加密频段联络：访问基地信息页面的联络表单',
                        '电子邮件：privacy@zane-industries.com（虚构）',
                        '响应时限：我们将在收到请求后72小时内作出回应'
                    ]
                }
            ]
        },

        // ----------------------------------------
        // 使用条款
        // ----------------------------------------
        terms: {
            id: 'terms',
            title: '使用条款',
            subtitle: 'Terms of Service',
            icon: 'description',
            lastUpdated: '2042年1月15日',
            quote: {
                text: '规则不是枷锁，而是秩序的骨架。没有规则的监狱，只是一片废墟。',
                author: '典狱长'
            },
            intro: '欢迎进入监狱重工的数字领地。本协议自您踏入这片领地之时起生效，它定义了您在此期间的权限边界与行为准则。请仔细阅读以下条款——毕竟，监狱的规则由典狱长制定。',
            sections: [
                {
                    id: 'entry-protocol',
                    heading: '入场协议',
                    headingEn: 'Entry Protocol',
                    content: '通过访问本网站，您确认：',
                    items: [
                        '您已阅读、理解并同意受本条款约束',
                        '您具有签订具有法律约束力协议的完全行为能力',
                        '如代表组织访问，您有权代表该组织接受本条款'
                    ],
                    note: '如您不同意本条款的任何部分，请立即离开本站。我们不会派坦克去找您，但您将无法使用我们的服务。'
                },
                {
                    id: 'prison-archives',
                    heading: '监狱档案',
                    headingEn: 'Prison Archives',
                    content: '本网站提供以下内容与服务：',
                    items: [
                        '产品信息展示：监狱重工(ZNHI)与监狱运输(ZNTP)系列产品资料',
                        '企业信息：公司背景、发展历程、设计理念',
                        '联络渠道：通过加密频段与我们建立通讯',
                        '信息订阅：获取最新产品动态与行业资讯'
                    ],
                    note: '所有展示的产品均为虚构创作，仅供娱乐与艺术欣赏目的。'
                },
                {
                    id: 'code-of-conduct',
                    heading: '行为准则',
                    headingEn: 'Code of Conduct',
                    content: '在监狱领地内，以下行为被严格禁止：',
                    items: [
                        '任何形式的恶意攻击、入侵或破坏行为',
                        '未经授权的数据采集、爬取或自动化访问',
                        '试图对本站进行逆向工程——我们不会派坦克去找您，但法务部门可能会',
                        '传播虚假信息或冒充监狱重工官方身份',
                        '任何违反当地法律法规的行为'
                    ]
                },
                {
                    id: 'classified-assets',
                    heading: '机密资产',
                    headingEn: 'Classified Assets',
                    content: '本网站的所有内容均为监狱重工的知识产权：',
                    items: [
                        '所有产品设计、图像、3D模型、文字描述均受版权保护',
                        '"监狱重工"、"ZANE"、"ZNHI"、"ZNTP"等标识为我们的商标',
                        '未经书面授权，不得复制、修改、分发或商业使用任何内容',
                        '个人非商业性质的分享需注明出处'
                    ],
                    note: '这些内容是典狱长的子嗣们的肖像与档案，请给予应有的尊重。'
                },
                {
                    id: 'liability-perimeter',
                    heading: '责任边界',
                    headingEn: 'Liability Perimeter',
                    content: '关于免责声明，我们需要明确以下几点：',
                    items: [
                        '本网站展示的所有产品均为虚构创作，不代表真实军事装备',
                        '产品规格、性能数据仅供参考，不构成任何形式的承诺',
                        '我们不对因使用本站信息而产生的任何直接或间接损失负责',
                        '外部链接内容不在我们的控制范围内'
                    ],
                    note: '若您故意涉险，监狱不对造成的任何损失负责——这是我们一贯的立场。'
                },
                {
                    id: 'protocol-amendment',
                    heading: '协议修订',
                    headingEn: 'Protocol Amendment',
                    content: '我们保留随时更新本协议的权利：',
                    items: [
                        '重大变更将在网站上公告',
                        '继续使用本站即表示您接受更新后的条款',
                        '建议您定期查阅本页面以了解最新规定'
                    ]
                },
                {
                    id: 'exit-procedure',
                    heading: '出场程序',
                    headingEn: 'Exit Procedure',
                    content: '您可以随时停止使用本网站。此外：',
                    items: [
                        '如您违反本条款，我们保留限制您访问的权利',
                        '终止使用后，您仍需遵守知识产权相关条款',
                        '我们可能保留必要的日志数据用于安全审计'
                    ]
                },
                {
                    id: 'arbitration',
                    heading: '仲裁协议',
                    headingEn: 'Arbitration',
                    content: '关于争议解决：',
                    items: [
                        '本协议受创作者所在地法律管辖',
                        '任何争议应首先通过友好协商解决',
                        '如协商不成，双方同意提交有管辖权的法院裁决'
                    ],
                    note: '当然，作为一家虚构企业，我们更希望一切都能在友好的氛围中解决。'
                }
            ]
        },

        // ----------------------------------------
        // 安全合规
        // ----------------------------------------
        security: {
            id: 'security',
            title: '安全合规',
            subtitle: 'Security & Compliance',
            icon: 'verified_user',
            lastUpdated: '2042年1月15日',
            quote: {
                text: '我们的防护不仅仅是为了阻挡入侵者，更是为了让身处其中的人安心。',
                author: '典狱长'
            },
            intro: '作为一家（虚构的）涉及国防科技的企业，安全合规是我们专业性的核心体现。我们的安全标准源自同一套服务于军事级别防护的体系——虽然我们只是一个展示网站，但这不妨碍我们认真对待每一个安全细节。',
            sections: [
                {
                    id: 'defense-doctrine',
                    heading: '防护纲领',
                    headingEn: 'Defense Doctrine',
                    content: '监狱重工的安全理念建立在以下核心原则之上：',
                    items: [
                        '纵深防御：多层安全措施，任何单点失败不会导致全面崩溃',
                        '最小权限：每个系统组件仅拥有完成其功能所需的最小权限',
                        '持续监控：安全不是一次性配置，而是持续的过程',
                        '快速响应：当威胁出现时，能够迅速识别并采取行动'
                    ]
                },
                {
                    id: 'encryption-protocol',
                    heading: '加密协议',
                    headingEn: 'Encryption Protocol',
                    content: '所有数据传输均采用端到端加密——与我们的战地通讯同一标准：',
                    items: [
                        'HTTPS/TLS 1.3：所有网页通讯强制使用加密连接',
                        'HSTS策略：防止降级攻击，确保始终使用安全连接',
                        '证书透明度：SSL证书接受公开审计',
                        '前向保密：即使长期密钥泄露，历史通讯仍然安全'
                    ]
                },
                {
                    id: 'clearance-system',
                    heading: '权限等级',
                    headingEn: 'Clearance System',
                    content: '我们实施严格的访问控制体系：',
                    items: [
                        '角色分离：不同职能的人员拥有不同的访问权限',
                        '双因素认证：管理系统访问需要多重身份验证',
                        '审计日志：所有敏感操作均有完整记录',
                        '定期审查：权限分配定期评估，及时撤销不必要的访问'
                    ]
                },
                {
                    id: 'infrastructure',
                    heading: '基础设施',
                    headingEn: 'Infrastructure',
                    content: '本站部署于可靠的基础设施之上：',
                    items: [
                        '静态托管：采用GitHub Pages等成熟平台，降低攻击面',
                        'CDN加速：内容分发网络提供额外的防护层',
                        'DDoS防护：具备抵御分布式拒绝服务攻击的能力',
                        '自动化部署：减少人为操作失误的可能性'
                    ]
                },
                {
                    id: 'compliance-framework',
                    heading: '合规框架',
                    headingEn: 'Compliance Framework',
                    content: '虽然作为虚构企业我们没有强制合规要求，但我们仍然参考以下标准：',
                    items: [
                        '隐私保护：参考GDPR等隐私法规的核心原则',
                        '无障碍访问：努力符合WCAG可访问性指南',
                        '安全最佳实践：遵循OWASP等安全组织的建议',
                        '内容安全策略：实施CSP等现代Web安全机制'
                    ]
                },
                {
                    id: 'patrol-protocol',
                    heading: '巡查机制',
                    headingEn: 'Patrol Protocol',
                    content: '我们的安全监控包括：',
                    items: [
                        '代码审查：所有变更在部署前经过审核',
                        '依赖扫描：定期检查第三方库的已知漏洞',
                        '访问监控：异常流量模式触发警报',
                        '完整性验证：确保部署内容未被篡改'
                    ]
                },
                {
                    id: 'emergency-response',
                    heading: '应急预案',
                    headingEn: 'Emergency Response',
                    content: '当安全事件发生时，我们的响应流程如下：',
                    items: [
                        '识别：快速确定事件的性质和范围',
                        '遏制：采取措施防止事态进一步扩大',
                        '根除：消除威胁的根本原因',
                        '恢复：将系统恢复到正常运行状态',
                        '复盘：分析事件原因，改进防护措施'
                    ]
                },
                {
                    id: 'security-channel',
                    heading: '安全频段',
                    headingEn: 'Security Channel',
                    content: '如果您发现任何安全漏洞或可疑活动，请通过以下渠道报告：',
                    items: [
                        '安全邮箱：security@zane-industries.com（虚构）',
                        'GitHub Issues：通过项目仓库提交安全报告',
                        '负责任披露：我们承诺对善意的安全研究者保持友好态度'
                    ],
                    note: '我们感谢每一位帮助我们改进安全性的朋友。在监狱，我们重视那些让防线更加坚固的人。'
                }
            ]
        }
    };

    // ============================================
    // 工具函数
    // ============================================

    /**
     * HTML转义，防止XSS攻击
     */
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // ============================================
    // 渲染函数
    // ============================================

    /**
     * 渲染列表项
     */
    function renderList(items) {
        if (!items || items.length === 0) return '';
        return `
            <ul class="legal-list text-gray-400 mt-4">
                ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        `;
    }

    /**
     * 渲染单个章节
     */
    function renderSection(section) {
        const noteHtml = section.note
            ? `<div class="mt-6 p-4 bg-surface-highlight/50 border-l-2 border-primary/30">
                   <p class="text-sm text-gray-500 italic">${escapeHtml(section.note)}</p>
               </div>`
            : '';

        return `
            <div class="legal-section" id="${section.id}">
                <div class="flex items-center gap-3 mb-4">
                    <h2 class="text-xl md:text-2xl font-display text-white">${escapeHtml(section.heading)}</h2>
                    <span class="text-xs text-gray-600 uppercase tracking-wider hidden md:inline">${escapeHtml(section.headingEn)}</span>
                </div>
                <p class="text-gray-400 leading-relaxed">${escapeHtml(section.content)}</p>
                ${renderList(section.items)}
                ${noteHtml}
            </div>
        `;
    }

    /**
     * 渲染完整文档
     */
    function renderDocument(docId) {
        const doc = LEGAL_DATA[docId];
        if (!doc) {
            return renderError(docId);
        }

        const sectionsHtml = doc.sections.map(s => renderSection(s)).join('');

        return `
            <div class="max-w-[1000px] mx-auto px-6 md:px-16 py-12 md:py-16">
                <!-- 文档头部 -->
                <div class="mb-12 pb-8 border-b border-white/5">
                    <!-- 图标和副标题 -->
                    <div class="flex items-center gap-3 mb-4">
                        <span class="material-symbols-outlined text-primary text-2xl">${doc.icon}</span>
                        <span class="text-xs text-gray-500 uppercase tracking-[0.2em]">${escapeHtml(doc.subtitle)}</span>
                    </div>
                    <!-- 标题 -->
                    <h1 class="text-3xl md:text-4xl font-display text-white mb-4">${escapeHtml(doc.title)}</h1>
                    <!-- 更新日期 -->
                    <p class="text-sm text-gray-600 mb-8">最后更新：${escapeHtml(doc.lastUpdated)}</p>

                    <!-- 典狱长语录 -->
                    <blockquote class="border-l-2 border-primary/50 pl-6 py-2">
                        <p class="text-lg text-gray-300 font-display italic leading-relaxed">"${escapeHtml(doc.quote.text)}"</p>
                        <footer class="mt-2 text-sm text-gray-500">—— ${escapeHtml(doc.quote.author)}</footer>
                    </blockquote>
                </div>

                <!-- 引言 -->
                <div class="mb-12 pb-8 border-b border-white/5">
                    <p class="text-gray-400 leading-loose">${escapeHtml(doc.intro)}</p>
                </div>

                <!-- 文档章节 -->
                <div class="space-y-8">
                    ${sectionsHtml}
                </div>

                <!-- 文档底部 -->
                <div class="mt-16 pt-8 border-t border-white/5 text-center">
                    <p class="text-xs text-gray-600 uppercase tracking-widest mb-2">End of Document</p>
                    <p class="text-gray-500 text-sm">© 2042 ZANE Heavy Industries. All rights reserved.</p>
                </div>
            </div>
        `;
    }

    /**
     * 渲染错误页面
     */
    function renderError(section) {
        return `
            <div class="max-w-[1000px] mx-auto px-6 md:px-16 py-16 text-center">
                <span class="material-symbols-outlined text-6xl text-gray-600 mb-4">error</span>
                <h2 class="text-2xl font-display text-white mb-2">文档未找到</h2>
                <p class="text-gray-500 mb-8">请求的文档 "${escapeHtml(section)}" 不存在于我们的档案中。</p>
                <a href="legal.html?section=privacy" class="inline-flex items-center gap-2 text-primary hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">arrow_back</span>
                    <span class="text-sm">返回隐私协议</span>
                </a>
            </div>
        `;
    }

    // ============================================
    // Tab切换逻辑
    // ============================================

    /**
     * 更新Tab按钮的激活状态
     */
    function updateTabHighlight(section) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            const isActive = btn.dataset.section === section;
            btn.classList.toggle('active', isActive);
        });
    }

    /**
     * 切换到指定章节
     */
    function switchSection(newSection) {
        const container = document.getElementById('legal-content');
        if (!container) return;

        // 淡出动画
        container.style.opacity = '0';

        setTimeout(() => {
            // 更新内容
            container.innerHTML = renderDocument(newSection);

            // 更新Tab高亮
            updateTabHighlight(newSection);

            // 更新URL（不刷新页面）
            if (typeof UrlUtils !== 'undefined') {
                UrlUtils.setParam('section', newSection);
            }

            // 淡入动画
            setTimeout(() => {
                container.style.opacity = '1';
            }, 10);

            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }

    /**
     * 初始化Tab点击事件
     */
    function initTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                if (section) {
                    switchSection(section);
                }
            });
        });
    }

    // ============================================
    // 浏览器历史支持
    // ============================================

    /**
     * 监听浏览器前进/后退
     */
    function initHistorySupport() {
        window.addEventListener('popstate', () => {
            const section = (typeof UrlUtils !== 'undefined' && UrlUtils.getParam('section')) || DEFAULT_SECTION;
            const container = document.getElementById('legal-content');
            if (container) {
                container.innerHTML = renderDocument(section);
                updateTabHighlight(section);
            }
        });
    }

    // ============================================
    // 页面初始化
    // ============================================

    function init() {
        const container = document.getElementById('legal-content');
        if (!container) {
            console.error('[LegalPage] 未找到内容容器 #legal-content');
            return;
        }

        // 获取URL参数中的section，默认为privacy
        const section = (typeof UrlUtils !== 'undefined' && UrlUtils.getParam('section')) || DEFAULT_SECTION;

        // 验证section是否有效
        const validSection = LEGAL_DATA[section] ? section : DEFAULT_SECTION;

        // 渲染内容
        container.innerHTML = renderDocument(validSection);

        // 更新Tab高亮
        updateTabHighlight(validSection);

        // 初始化Tab点击事件
        initTabSwitching();

        // 初始化浏览器历史支持
        initHistorySupport();

        console.log('[LegalPage] 初始化完成，当前显示:', validSection);
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
