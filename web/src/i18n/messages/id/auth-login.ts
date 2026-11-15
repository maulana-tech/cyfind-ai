/** Halaman masuk: label formulir, pesan status, dan dialog ketentuan. */

const messages = {
  无法连接到后端服务: "Tidak dapat terhubung ke layanan backend",

  "请先阅读并同意《使用须知》": "Harap baca dan setujui Ketentuan Penggunaan terlebih dahulu",
  用户名或密码错误: "Nama pengguna atau kata sandi salah",

  "正在检查登录状态…": "Memeriksa status masuk…",
  登录: "Masuk",

  "欢迎回来，请输入密码以继续使用 CYFIND":
    "Selamat datang kembali. Masukkan kata sandi untuk melanjutkan penggunaan CYFIND",
  用户名: "Nama pengguna",

  密码: "Kata sandi",

  请输入密码: "Masukkan kata sandi",

  我已阅读并同意: "Saya telah membaca dan menyetujui ",

  "《使用须知》": "Ketentuan Penggunaan",
  "登录中...": "Sedang masuk…",
  "CYFIND 使用须知与免责声明": "CYFIND Ketentuan Penggunaan dan Penafian",
  "版本 v1.0 · 生效日期 2026-09-18 · 请在登录前完整阅读以下全部条款":
    "Versi v1.0 · Berlaku sejak 2026-09-18 · Harap baca seluruh ketentuan berikut secara lengkap sebelum masuk",
  '本《使用须知与免责声明》（以下简称"本声明"）是您与 CYFIND 项目作者及贡献者之间就使用本软件所达成的约定。请您在使用前审慎阅读、充分理解各条款内容，特别是以粗体或色块标注的免责、责任限制及禁止性条款。':
    'Ketentuan Penggunaan dan Penafian ini (selanjutnya disebut "Pernyataan ini") merupakan perjanjian antara Anda dengan para penulis dan kontributor proyek CYFIND mengenai penggunaan Perangkat Lunak ini. Harap membaca setiap ketentuan dengan saksama dan memahaminya secara sepenuhnya sebelum menggunakannya, khususnya klausul penafian, batasan tanggung jawab, dan larangan yang ditandai dengan huruf tebal atau blok warna.',
  "一旦您下载、安装、访问或以任何方式使用本软件，即视为您已阅读、理解并同意接受本声明的全部约束。":
    "Begitu Anda mengunduh, memasang, mengakses, atau menggunakan Perangkat Lunak ini dengan cara apa pun, Anda dianggap telah membaca, memahami, dan menyetujui untuk terikat sepenuhnya oleh Pernyataan ini.",
  "第一条 · 定义与开源许可": "Pasal 1 · Definisi dan Lisensi Sumber Terbuka",
  "本软件（CYFIND）是一款基于 GNU Affero General Public License v3.0（AGPL-3.0）发布的开源程序。您可依据该协议自由使用、复制、修改和分发本软件；但任何衍生作品（包括通过网络向第三方提供的在线服务）均须同样以 AGPL-3.0 协议开源并向使用者公开对应的完整源代码。AGPL-3.0 完整条款以随附的 LICENSE 文件为准。":
    "Perangkat Lunak (Cyfind AI) adalah perangkat lunak sumber terbuka yang dirilis di bawah Lisensi MIT. Anda bebas menggunakan, menyalin, memodifikasi, menggabungkan, menerbitkan, mendistribusikan, mensublisensikan, dan menjual salinan Perangkat Lunak ini, dengan syarat pemberitahuan hak cipta dan izin disertakan. Ketentuan lengkap diatur dalam berkas LICENSE yang disertakan.",
  "第二条 · 授权使用范围": "Pasal 2 · Cakupan Penggunaan yang Diizinkan",
  "本软件仅供个人学习、代码研究、安全技术原理探讨，以及在您自行搭建的本地隔离环境中进行技术验证之用，适用于学习、学术研究、代码审阅等非攻击性、非破坏性用途。除本条明确许可的情形外，您不得将本软件用于任何其他目的。":
    "Perangkat Lunak ini disediakan semata-mata untuk pembelajaran pribadi, penelitian kode, pembahasan prinsip teknologi keamanan, serta verifikasi teknis di lingkungan terisolasi lokal yang Anda bangun sendiri; berlaku untuk tujuan non-agresif dan non-destruktif seperti pembelajaran, penelitian akademik, dan tinjauan kode. Selain keadaan yang diizinkan secara tegas dalam Pasal ini, Anda tidak boleh menggunakan Perangkat Lunak ini untuk tujuan apa pun lainnya.",
  "第三条 · 禁止行为": "Pasal 3 · Perilaku yang Dilarang",
  "严禁对任何网站、线上服务、他人或第三方所有的联网系统发起扫描、探测、利用或攻击（无论是否已获得授权、是否为您自有资产）；":
    "Anda dilarang memindai, memeriksa, mengeksploitasi, atau menyerang situs web, layanan daring, atau sistem jaringan mana pun yang dimiliki pihak lain atau pihak ketiga (terlepas dari apakah Anda telah memperoleh izin, dan terlepas dari apakah itu aset Anda sendiri);",
  "严禁将本软件用于任何实际的渗透测试、攻防对抗、红蓝演练或生产环境；":
    "Anda dilarang menggunakan Perangkat Lunak ini untuk pengujian penetrasi nyata, latihan serangan dan pertahanan, latihan tim merah atau tim biru, atau lingkungan produksi;",
  "严禁将本软件用于非法入侵、数据窃取、勒索、拒绝服务（DoS/DDoS）或任何破坏性、犯罪性活动；":
    "Anda dilarang menggunakan Perangkat Lunak ini untuk penyusupan tidak sah, pencurian data, pemerasan, penolakan layanan (DoS/DDoS), atau kegiatan destruktif atau kriminal apa pun;",
  "严禁移除、篡改或规避本软件及其输出中的任何版权、许可或安全提示信息；":
    "Anda dilarang menghapus, memanipulasi, atau menghindari informasi hak cipta, lisensi, atau pemberitahuan keamanan apa pun dalam Perangkat Lunak ini maupun keluarannya;",
  "严禁从事任何违反您所在国家或地区法律、法规及监管规定的行为。":
    "Anda dilarang melakukan segala perbuatan yang melanggar hukum, peraturan, atau ketentuan regulasi di negara atau wilayah Anda.",
  "第四条 · 知识产权": "Pasal 4 · Kekayaan Intelektual",
  "本软件的著作权及相关知识产权归项目作者及贡献者所有，并在 AGPL-3.0 协议约定的范围内向您授予相应权利。除该协议明确授予的权利外，本声明未以明示或默示方式授予您任何其他权利。":
    'Hak cipta dan hak kekayaan intelektual terkait atas Perangkat Lunak ini dimiliki oleh para penulis dan kontributor proyek. Perangkat Lunak disediakan "sebagaimana adanya", tanpa jaminan apa pun; hak yang diberikan kepada Anda adalah sebagaimana diatur dalam Lisensi MIT pada berkas LICENSE yang disertakan.',
  "第五条 · 数据与隐私": "Pasal 5 · Data dan Privasi",
  "本软件为可自行部署的开源程序，作者不运营任何集中式服务、亦不会收集或上传您的使用数据。您在使用过程中产生、处理或接触的一切数据，均由您自行掌控并负责其合法性与安全性；因数据处理不当引发的任何后果由您自行承担。":
    "Perangkat Lunak ini adalah program sumber terbuka yang dapat Anda hosting sendiri; para penulisnya tidak mengoperasikan layanan terpusat mana pun dan tidak akan mengumpulkan atau mengunggah data penggunaan Anda. Seluruh data yang Anda hasilkan, proses, atau temui selama penggunaan berada di bawah kendali Anda sepenuhnya, dan Anda bertanggung jawab atas keabsahan serta keamannya; Anda menanggung segala akibat yang timbul akibat penanganan data yang tidak semestinya.",
  "第六条 · 合规与法律责任": "Pasal 6 · Kepatuhan dan Tanggung Jawab Hukum",
  "您应自行遵守所在国家或地区关于网络安全、数据安全与个人信息保护、计算机犯罪等方面的全部法律法规（在中国大陆包括但不限于《网络安全法》《数据安全法》《个人信息保护法》及相关司法解释）。":
    "Anda wajib mematuhi secara mandiri seluruh hukum dan peraturan di negara atau wilayah Anda mengenai keamanan siber, keamanan data dan perlindungan data pribadi, kejahatan komputer, dan sebagainya (di Tiongkok daratan termasuk namun tidak terbatas pada Cybersecurity Law, Data Security Law, Personal Information Protection Law, serta tafsir yudisial yang relevan).",
  "因您违反上述法律法规或本声明约定而产生的一切法律责任与后果，均由您本人独立承担，与本软件作者及贡献者无关。":
    "Segala tanggung jawab dan akibat hukum yang timbul dari pelanggaran Anda terhadap hukum dan peraturan tersebut di atas maupun ketentuan Pernyataan ini menjadi tanggung jawab Anda sepenuhnya, dan tidak berkaitan dengan para penulis dan kontributor Perangkat Lunak ini.",
  "第七条 · 免责声明与责任限制": "Pasal 7 · Penafian dan Batasan Tanggung Jawab",
  '本软件按"现状（AS IS）"与"现有（AS AVAILABLE）"状态提供，不附带任何明示或默示的担保，包括但不限于对适销性、特定用途适用性、准确性及不侵权的担保。在适用法律允许的最大范围内，本软件作者及贡献者不对因使用或无法使用本软件（无论使用方式是否得当）而导致的任何直接、间接、偶然、特殊或后果性损失承担责任，包括但不限于数据丢失、系统损坏、业务中断、利润损失或法律纠纷。':
    'Perangkat Lunak ini disediakan dalam keadaan "sebagaimana adanya" (AS IS) dan "sebagaimana tersedia" (AS AVAILABLE), tanpa jaminan apa pun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan dapat diperjualbelikan, kesesuaian untuk tujuan tertentu, keakuratan, dan tidak melanggar hak pihak lain. Sejauh diizinkan oleh hukum yang berlaku, para penulis dan kontributor Perangkat Lunak ini tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial apa pun yang timbul dari penggunaan atau ketidakmampuan menggunakan Perangkat Lunak ini (terlepas dari apakah penggunaannya tepat atau tidak), termasuk namun tidak terbatas pada kehilangan data, kerusakan sistem, gangguan bisnis, hilangnya keuntungan, atau sengketa hukum.',
  "第八条 · 条款变更与最终解释": "Pasal 8 · Perubahan Ketentuan dan Tafsir Akhir",
  "作者有权根据法律法规或项目发展需要不时更新本声明，更新后的版本将随项目发布并自公布之日起生效；您继续使用本软件即视为接受修订后的条款。在法律允许的范围内，本声明的最终解释权归项目作者所有。若本声明任一条款被认定为无效，不影响其余条款的效力。":
    "Penulis berhak memperbarui Pernyataan ini dari waktu ke waktu sesuai kebutuhan hukum dan peraturan atau perkembangan proyek; versi yang diperbarui akan dirilis bersama proyek dan berlaku sejak tanggal pengumuman, dan kelanjutan penggunaan Anda atas Perangkat Lunak ini dianggap sebagai penerimaan atas ketentuan yang telah diubah. Sejauh diizinkan oleh hukum, hak tafsir akhir atas Pernyataan ini terletak pada para penulis proyek. Jika ada ketentuan dalam Pernyataan ini dinyatakan tidak sah, keabsahan ketentuan lainnya tidak terpengaruh.",
  您已浏览全部条款: "Anda telah menelusuri seluruh ketentuan",

  请将条款滚动至底部后再确认: "Harap gulir ke bagian bawah ketentuan sebelum mengonfirmasi",

  我已阅读并同意全部条款: "Saya telah membaca dan menyetujui seluruh ketentuan",
} satisfies Record<string, string>;

export default messages;
