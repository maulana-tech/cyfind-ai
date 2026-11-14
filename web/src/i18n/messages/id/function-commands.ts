/** Kosakata halaman Perintah (kunci = string zh-CN asli). */
const commands = {
  命令: "Perintah",

  执行: "Eksekusi",

  停止: "Hentikan",

  重新执行: "Jalankan Kembali",

  超时设置: "Setting Waktu Habis",

  重试次数: "Jumlah Ulang",

  最大重试: "Maksimal Ulang",

  等待开始: "Menunggu Mulai",

  等待中: "Menunggu",

  调度中: "Jadwal",

  已取消: "Dibatalkan",

  已暂停: "Dijeda",

  继续执行: "Lanjutkan Eksekusi",

  停止任务: "Hentikan Tugas",

  任务日志: "Log Tugas",

  任务输出: "Output Tugas",

  任务输入: "Input Tugas",

  任务参数: "Parameter Tugas",

  参数验证: "Validasi Parameter",

  参数错误: "Kesalahan Parameter",

  必填项: "Wajib",

  选填项: "Pilih Saja",

  默认值: "Nilai Default",

  自定义默认值: "Nilai Default Khusus",

  动态默认值: "Nilai Default Dinamis",

  取值范围: "Rang Nilai",

  最小值: "Minimum",

  最大值: "Maksimal",

  步长: "Langkah",

  精度: "Presisi",

  小数位: "Desimal",

  整数: "Bulat",

  浮点数: "Float",

  科学计数法: "Notasi Sains",

  位运算: "Operasi Bit",

  与: "Dan",

  或: "Atau",

  非: "Bukan",

  异或: "XOR",

  左移: "Geser Kiri",

  右移: "Geser Kanan",

  取反: "Negasi",

  补码: "Komplement 2",

  码制: "Gaya Kode",

  大端模式: "Big-endian",

  小端模式: "Little-endian",

  网络字节序: "Network Byte Order",

  主机字节序: "Host Byte Order",

  字节序: "Byte Order",

  大端: "Big-endian",

  小端: "Little-endian",

  混合模式: "Mixed-endian",

  字节序转换: "Byte Order Conversion",

  末尾补零: "Trailing Zeros",

  前导补零: "Leading Zeros",

  无符号: "Unsigned",

  有符号: "Signed",

  补码表示: "Two's Complement Representation",

  移码: "Ones' Complement",

  反码: "Sign-magnitude Representation",

  移位运算: "Operasi Pindah Bit",

  逻辑移位: "Logical Shift",

  算术移位: "Arithmetic Shift",

  循环左移: "Putar Kiri",

  循环右移: "Putar Kanan",

  扩展位宽: "Lebar Bit Width Extension",

  截断: "Truncation",

  零填充: "Zero Fill",

  符号扩展: "Sign Extension",

  算术右移: "Arithmetic Right Shift",

  左移一位: "Geser Kiri Satu",

  右移一位: "Geser Kanan Satu",

  循环左移一位: "Putar Kiri Satu",

  循环右移一位: "Putar Kanan Satu",

  "位 masks": "Bit Masks",
  掩码: "Mask",

  位图: "Bitmap",

  布尔运算: "Operasi Boolean",

  与运算: "Bitwise AND",

  或运算: "Bitwise OR",

  异或运算: "Bitwise XOR",

  与非运算: "Bitwise AND NOT",

  右移运算: "Operasi Pindah Kanan",

  左移运算: "Operasi Pindah Kiri",

  测试位: "Test Bit",

  清除位: "Clear Bit",

  设置位: "Set Bit",

  翻转位: "Toggle Bit",

  获取位: "Get Bit",

  设置所有位: "Set All Bits",

  清除所有位: "Clear All Bits",

  翻转所有位: "Toggle All Bits",

  位域: "Bidang Bit",

  位域偏移: "Bit Field Offset",

  位域长度: "Bit Field Length",

  位域掩码: "Bit Field Mask",

  位域值: "Bit Field Value",

  位域重置: "Bit Field Reset",

  位域设置: "Bit Field Set",

  位域获取: "Bit Field Get",

  位域测试: "Bit Field Test",

  位域比较: "Bit Field Compare",

  位域拼接: "Bit Field Concatenation",

  位域拆解: "Bit Field Decode",

  位域编码: "Bit Field Encode",

  位域序列化: "Bit Field Serialization",

  位域反序列化: "Bit Field Deserialization",

  位域哈希: "Bit Field Hash",

  位域索引: "Bit Field Index",

  位域数组: "Bit Field Array",

  位域结构体: "Bit Field Structure",

  位域联合体: "Bit Field Union",

  位域枚举: "Bit Field Enum",

  位域标志: "Bit Field Flags",

  位域标记: "Bit Field Mark",

  位域标识: "Bit Field Identity",

  位域类型: "Bit Field Type",

  位域大小: "Bit Field Size",

  位域对齐: "Bit Field Alignment",

  位域填充: "Bit Field Padding",

  位域填充位: "Bit Field Padding Bits",

  位域对齐偏移: "Bit Field Alignment Offset",

  位域对齐长度: "Bit Field Alignment Length",

  位域对齐单位: "Bit Field Alignment Unit",

  位域对齐模式: "Bit Field Alignment Mode",

  位域对齐策略: "Bit Field Alignment Policy",

  位域对齐规则: "Bit Field Alignment Rule",

  位域对齐限制: "Bit Field Alignment Limit",

  位域对齐约束: "Bit Field Alignment Constraint",

  位域对齐要求: "Bit Field Alignment Requirement",

  位域对齐目标: "Bit Field Alignment Target",

  位域对齐目标地址: "Bit Field Alignment Target Address",

  位域对齐目标长度: "Bit Field Alignment Target Length",

  位域对齐目标偏移: "Bit Field Alignment Target Offset",

  位域对齐目标单位: "Bit Field Alignment Target Unit",

  位域对齐目标模式: "Bit Field Alignment Target Mode",

  位域对齐目标策略: "Bit Field Alignment Target Strategy",

  位域对齐目标规则: "Bit Field Alignment Target Rule",

  位域对齐目标限制: "Bit Field Alignment Target Limit",

  位域对齐目标约束: "Bit Field Alignment Target Constraint",

  位域对齐目标要求: "Bit Field Alignment Target Requirement",

  位域对齐目标目标: "Bit Field Alignment Target Target",
} satisfies Record<string, string>;
export default commands;
