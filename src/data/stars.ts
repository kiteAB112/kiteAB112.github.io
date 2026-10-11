export interface StarGroup { name: string; description?: string; repositories: string[]; }
export interface StarNote { id: string; title: string; description: string; published: string; tags: string[]; reason: string; repository: string; }

export const starGroups: StarGroup[] = [
  { name: 'RSS', description: '安全资讯与订阅源收集。', repositories: ['zhengjim/Chinese-Security-RSS', 'arch3rPro/SecurityRSS', 'zer0yu/CyberSecurityRSS', 'DIYgod/RSSHub', 'RSSNext/Folo'] },
  { name: 'Future Code_audit', description: '为未来自动化 AI 代码审计积累的项目。', repositories: ['tizuio/TizuMark'] },
  { name: 'Info_search', description: '信息收集、资产发现与枚举工具。', repositories: ['projectdiscovery/subfinder', 'knownsec/ksubdomain', 'projectdiscovery/dnsx', 'projectdiscovery/naabu', 'OJ/gobuster', 'ffuf/ffuf', 'urbanadventurer/WhatWeb', 'xiecat/fofax', 'projectdiscovery/httpx', 'HG-ha/ICP_Query'] },
  { name: 'AI SEC', description: 'AI 安全学习路径与参考资料。', repositories: ['DeepSpaceHarbor/Awesome-AI-Security', 'muellerberndt/awesome-ai-security', 'TalEliyahu/Awesome-AI-Security', 'ottosulin/awesome-ai-security', 'Acmesec/theAIMythbook', 'OWASP/www-project-top-10-for-large-language-model-applications', '0Chencc/clawgod'] },
  { name: 'Web_Sec', description: 'Web 漏洞、扫描、靶场与攻防实践。', repositories: ['SickleSec/SnowEyes', 'Ad1euDa1e/VueCrack', 'chaitin/xray', 'safe6Sec/ShiroExp', 'LandGrey/SpringBootVulExploit', 'AabyssZG/SpringBoot-Scan', 's0md3v/XSStrike', 'x364e3ab6/DudeSuite', 'PortSwigger/turbo-intruder', 'projectdiscovery/nuclei', 'projectdiscovery/nuclei-templates'] },
  { name: 'Code_Audit', description: '代码审计、Java 与安全编码。', repositories: ['j3ers3/Hello-Java-Sec', 'whgojp/JavaSecLab', 'JoyChou93/java-sec-code', 'javaweb-sec/javaweb-sec', 'f1tz/cnseay', 'Tencent/secguide', 'frohoff/ysoserial'] },
  { name: 'Cloud_Sec', description: '云安全、IaC 与云靶场。', repositories: ['HXSecurity/TerraformGoat', 'teamssix/twiki', 'teamssix/awesome-cloud-security'] },
  { name: 'Security_Learning', description: '安全课程、知识库、靶场与 CTF。', repositories: ['satan1a/TheRoadOfSO', 'ckane/CS7038-Malware-Analysis', 'damit5/damit5.github.io', '414aaj/LingJing', 'djytmdj/Network-security-study-notes', 'olist213/Information_Security_Books', 'knownsec/404StarLink', 'WebGoat/WebGoat', 'LyleMi/Learn-Web-Hacking', 'crow821/crowsec', 'c0ny1/upload-labs', 'zhuifengshaonianhanlu/pikachu', 'skyblueee/sqli-labs-php7', 'Audi-1/sqli-labs', 'vulhub/vulhub', 'ProbiusOfficial/Hello-CTF', 'ctf-wiki/ctf-wiki'] },
  { name: 'Reverse_Engineering', description: '逆向、调试与反混淆。', repositories: ['0xsdeo/AntiDebug_Breaker', 'overspace-labs/MaR', 'overspace-labs/HaE', 'Ackites/KillWxapkg', 'pwndbg/pwndbg'] },
  { name: 'Offensive_Tools', description: '红队、利用、字典与辅助工具。', repositories: ['gophish/gophish', 'V4bel/dirtyfrag', 'reddelexc/hackerone-reports', 'danielmiessler/SecLists', 'guchangan1/All-Defense-Tool', 'vxcontrol/pentagi', 'Getshell/Mshell', 'nomi-sec/PoC-in-GitHub', 'TideSec/BypassAntiVirus', 'eeeeeeeeee-code/POC', 'jhao104/proxy_pool', 'zxcvbn001/password_brute_dictionary', 'rootphantomer/Blasting_dictionary'] },
  { name: 'Misc', description: '系统、效率工具及其他非安全收藏。', repositories: ['OpenListTeam/OpenList', 'torvalds/linux', 'ryanoasis/nerd-fonts', 'jitwxs/163MusicLyrics'] },
];

// The seven original curated notes, preserved with their legacy detail URLs.
export const starNotes: StarNote[] = [
  {
    "id": "awesome-cloud-security",
    "title": "Awesome Cloud Security",
    "description": "面向云安全学习者整理的资源索引，覆盖云原生、安全工具与知识材料。",
    "published": "2026-07-12",
    "tags": [
      "Cloud Security",
      "Knowledge Base",
      "Learning"
    ],
    "reason": "云安全领域变化很快，先拥有可靠的学习导航比一次性收藏大量工具更有价值。它适合做后续专题学习的入口。",
    "repository": "teamssix/awesome-cloud-security"
  },
  {
    "id": "javaseclab",
    "title": "JavaSecLab",
    "description": "覆盖漏洞缺陷、修复思路与安全编码规范的 Java 安全学习平台。",
    "published": "2026-07-12",
    "tags": [
      "Java Security",
      "Code Audit",
      "Lab"
    ],
    "reason": "Java 代码审计需要把漏洞成因、危险调用点与修复方式放在一起理解。这个项目适合作为可复现实验与代码阅读的参考素材。",
    "repository": "whgojp/JavaSecLab"
  },
  {
    "id": "nuclei",
    "title": "Nuclei",
    "description": "基于模板的快速漏洞扫描引擎，强调可组合的检测规则与社区协作。",
    "published": "2026-07-12",
    "tags": [
      "AppSec",
      "Detection",
      "Go"
    ],
    "reason": "关注它的不是“扫描更多”，而是把检测知识变成可审阅、可复用模板的工程方法。这对安全自动化和规则维护很有启发。",
    "repository": "projectdiscovery/nuclei"
  },
  {
    "id": "owasp-llm-top-10",
    "title": "OWASP Top 10 for LLM Applications",
    "description": "OWASP 面向大语言模型应用的十大风险项目，为 AI 安全学习提供共同语言。",
    "published": "2026-07-12",
    "tags": [
      "AI Security",
      "OWASP",
      "Risk"
    ],
    "reason": "在做 AI 安全项目之前，先建立风险分类与沟通框架很重要。这个项目适合用作需求评审、威胁建模和学习笔记的起点。",
    "repository": "OWASP/www-project-top-10-for-large-language-model-applications"
  },
  {
    "id": "pentagi",
    "title": "pentagi",
    "description": "面向复杂渗透测试任务的自主 AI Agent 系统，关注多智能体协作与安全自动化边界。",
    "published": "2026-07-12",
    "tags": [
      "AI Security",
      "Agent",
      "Automation"
    ],
    "reason": "它是理解 AI Agent 如何进入安全工作流的一个工程化参考：任务分解、工具调用、证据回收与人工复核都值得持续观察。",
    "repository": "vxcontrol/pentagi"
  },
  {
    "id": "vulhub",
    "title": "Vulhub",
    "description": "基于 Docker Compose 的预构建漏洞环境集合，便于复现实验与环境管理。",
    "published": "2026-07-12",
    "tags": [
      "Lab",
      "Docker",
      "Reproducibility"
    ],
    "reason": "安全学习很依赖稳定、可销毁、可重建的实验环境。它体现了把环境配置也作为复现材料的一部分来维护的思路。",
    "repository": "vulhub/vulhub"
  },
  {
    "id": "webgoat",
    "title": "WebGoat",
    "description": "OWASP 维护的故意不安全 Web 应用，用于在可控环境中学习常见 Web 风险。",
    "published": "2026-07-12",
    "tags": [
      "Web Security",
      "Lab",
      "OWASP"
    ],
    "reason": "学习安全知识时，能看到风险、修复与反馈的闭环比只看概念更重要。它提供了适合练习和记录的受控环境。",
    "repository": "WebGoat/WebGoat"
  }
];
