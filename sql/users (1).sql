-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2025 at 05:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `siamdrug_1`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `operator` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `pn_id` varchar(4) NOT NULL,
  `source` date NULL,
  `level` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

-- ลบข้อมูลเก่าก่อน (ถ้ามี) - ใช้ TRUNCATE เพื่อลบข้อมูลทั้งหมดและ reset AUTO_INCREMENT
TRUNCATE TABLE `users`;

-- ปิดการตรวจสอบ foreign key ชั่วคราว (ถ้ามี)
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `users` (`id`, `operator`, `password_hash`, `pn_id`, `source`, `level`, `created_at`) VALUES
(2, 'P.AKAPHOL', '5290', '0925', NULL, 'employee', '2025-09-22 04:22:34'),
(3, 'L.KANANG', '7773', '0926', NULL, 'employee', '2025-09-22 04:22:34'),
(4, 'T.JATUPORN', '6402', '0927', NULL, 'employee', '2025-09-22 04:22:34'),
(5, 'T.JIRATTIP', '2609', '0928', NULL, 'employee', '2025-09-22 04:22:34'),
(6, 'S.SUKANYA', '2295', '0929', NULL, 'employee', '2025-09-22 04:22:34'),
(7, 'C.MALEE', '8119', '0930', NULL, 'employee', '2025-09-22 04:22:34'),
(8, 'P.PRACH', '7818', '0931', NULL, 'employee', '2025-09-22 04:22:34'),
(9, 'T.NITTAYA', '3086', '0932', NULL, 'employee', '2025-09-22 04:22:34'),
(10, 'S.TIAMJAN', '2699', '0933', NULL, 'employee', '2025-09-22 04:22:34'),
(11, 'E.SURADEJ', '6288', '0934', NULL, 'employee', '2025-09-22 04:22:34'),
(12, 'P.JARIYA', '9153', '0935', NULL, 'employee', '2025-09-22 04:22:34'),
(13, 'T.SAMORN', '3319', '0936', NULL, 'employee', '2025-09-22 04:22:34'),
(14, 'K.PAPITCHA', '8788', '0937', NULL, 'employee', '2025-09-22 04:22:34'),
(15, 'K.SOITHONG', '9361', '0938', NULL, 'employee', '2025-09-22 04:22:34'),
(16, 'N.WIRAWAN', '7088', '0939', NULL, 'employee', '2025-09-22 04:22:34'),
(17, 'P.CHAYAPA', '1712', '0940', NULL, 'employee', '2025-09-22 04:22:34'),
(18, 'P.JIRAPORN', '8325', '0941', NULL, 'employee', '2025-09-22 04:22:34'),
(19, 'W.SINIRAT', '7513', '0942', NULL, 'employee', '2025-09-22 04:22:34'),
(20, 'CASHIER TRAINEE', '9966', '0699', NULL, 'employee', '2025-09-22 04:22:34'),
(21, 'T.JARUDPON', '7384', '0943', NULL, 'employee', '2025-09-22 04:22:34'),
(22, 'L.KORNKANO', '4490', '0944', NULL, 'employee', '2025-09-22 04:22:34'),
(23, '?J.POJJAMA', '5490', '0945', NULL, 'employee', '2025-09-22 04:22:34'),
(24, 'S.AUTSANEE', '1556', '0946', NULL, 'employee', '2025-09-22 04:22:34'),
(25, 'S.CHUTHAMA', '6821', '0947', NULL, 'employee', '2025-09-22 04:22:34'),
(26, 'S.NATTAVIT', '4361', '0948', NULL, 'employee', '2025-09-22 04:22:34'),
(27, 'D.PREEYAPH', '4484', '0949', NULL, 'employee', '2025-09-22 04:22:34'),
(28, 'P.LALIDA', '3018', '0950', NULL, 'employee', '2025-09-22 04:22:34'),
(29, 'S.WANNISA', '7691', '0951', NULL, 'employee', '2025-09-22 04:22:34'),
(30, 'CCCC', '', '0952', NULL, 'employee', '2025-09-22 04:22:34'),
(32, 'K.CHANAPORN', '6210', '0953', NULL, 'employee', '2025-09-22 04:22:34'),
(33, 'NATURE EXP', '459', '0954', NULL, 'employee', '2025-09-22 04:22:34'),
(34, 'C.SUBENYA', '2698', '0955', NULL, 'employee', '2025-09-22 04:22:34'),
(35, 'K.WATCHARA', '2380', '0956', NULL, 'employee', '2025-09-22 04:22:34'),
(36, 'N.VICHAI', '3551', '0957', NULL, 'employee', '2025-09-22 04:22:34'),
(37, 'D.PRAKAIPE', '1655', '0958', NULL, 'employee', '2025-09-22 04:22:34'),
(38, 'PC XPN NUT', '5900', '0959', NULL, 'employee', '2025-09-22 04:22:34'),
(39, 'N.MONTHIRA', '6832', '0960', NULL, 'employee', '2025-09-22 04:22:34'),
(40, 'W.SUMETTHI', '3566', '0961', NULL, 'employee', '2025-09-22 04:22:34'),
(41, 'P.SEKSILP', '7491', '0962', NULL, 'employee', '2025-09-22 04:22:34'),
(42, 'J.SOYMALA', '6850', '0963', NULL, 'employee', '2025-09-22 04:22:34'),
(43, 'P.RUKSANAN', '6390', '0964', NULL, 'employee', '2025-09-22 04:22:34'),
(44, 'C.TASTRAPO', '6855', '0965', NULL, 'employee', '2025-09-22 04:22:34'),
(45, 'S.POJJAMAN', '2310', '0966', NULL, 'employee', '2025-09-22 04:22:34'),
(46, 'P.KUNSINEE', '6662', '0967', NULL, 'employee', '2025-09-22 04:22:34'),
(47, 'S.KRITSANA', '2117', '0968', NULL, 'employee', '2025-09-22 04:22:34'),
(48, 'S.KANNIKA', '5592', '0969', NULL, 'employee', '2025-09-22 04:22:34'),
(49, 'S.KANLAYA', '1254', '0970', NULL, 'employee', '2025-09-22 04:22:34'),
(50, 'REAL ELIXI', '1790', '0971', NULL, 'employee', '2025-09-22 04:22:34'),
(51, 'M.RUJIRA', '6188', '0972', NULL, 'employee', '2025-09-22 04:22:34'),
(52, '??U.WICHITTRA', '5683', '0973', NULL, 'employee', '2025-09-22 04:22:35'),
(53, 'K.SUTISA', '8130', '0974', NULL, 'employee', '2025-09-22 04:22:35'),
(54, 'L.DARAWAN', '2206', '0975', NULL, 'employee', '2025-09-22 04:22:35'),
(55, 'D.PATCHARI', '9570', '0976', NULL, 'employee', '2025-09-22 04:22:35'),
(56, 'J.DARAK', '7497', '0977', NULL, 'employee', '2025-09-22 04:22:35'),
(57, 'C.PORNTHIP', '7379', '0978', NULL, 'employee', '2025-09-22 04:22:35'),
(58, 'F.NARUMOL', '5274', '0979', NULL, 'employee', '2025-09-22 04:22:35'),
(59, 'C.SUJIRAT', '5166', '0980', NULL, 'employee', '2025-09-22 04:22:35'),
(60, 'N.RADTANAR', '2471', '0981', NULL, 'employee', '2025-09-22 04:22:35'),
(61, 'P.PHATTARA', '5075', '0982', NULL, 'employee', '2025-09-22 04:22:35'),
(62, 'K.THANAPOR', '6302', '0983', NULL, 'employee', '2025-09-22 04:22:35'),
(63, 'S.THANAESO', '4047', '0984', NULL, 'employee', '2025-09-22 04:22:35'),
(64, 'NAN KHAM', '4345', '0985', NULL, 'employee', '2025-09-22 04:22:35'),
(65, 'R.PHANNARA', '9311', '0986', NULL, 'employee', '2025-09-22 04:22:35'),
(66, 'K.KHUN', '2028', '0987', NULL, 'employee', '2025-09-22 04:22:35'),
(68, 'A.SUPAPORN', '9165', '0988', NULL, 'employee', '2025-09-22 04:22:35'),
(69, 'T.THANAKOR', '3024', '0989', NULL, 'employee', '2025-09-22 04:22:35'),
(70, 'T.JUTITHID', '434', '0990', NULL, 'employee', '2025-09-22 04:22:35'),
(71, 'S.RUNGKANC', '458', '0991', NULL, 'employee', '2025-09-22 04:22:35'),
(72, 'R.CHUTIMA', '8200', '0992', NULL, 'employee', '2025-09-22 04:22:35'),
(73, 'C.NAMTARN', '5261', '0993', NULL, 'employee', '2025-09-22 04:22:35'),
(74, 'T.CHAUN', '902', '0994', NULL, 'employee', '2025-09-22 04:22:35'),
(75, 'J.WIWAT', '7015', '0995', NULL, 'employee', '2025-09-22 04:22:35'),
(76, 'O.CHOLLADA', '306', '0996', NULL, 'employee', '2025-09-22 04:22:35'),
(77, 'S.CHARTCHA', '5821', '0997', NULL, 'employee', '2025-09-22 04:22:35'),
(78, 'P.SRISUPA', '4901', '0998', NULL, 'employee', '2025-09-22 04:22:35'),
(79, 'A.ANAN', '4368', '0999', NULL, 'employee', '2025-09-22 04:22:35'),
(80, 'T.SURATTAN', '3491', '1000', NULL, 'employee', '2025-09-22 04:22:35'),
(81, 'K.PATTARAN', '2566', '1001', NULL, 'employee', '2025-09-22 04:22:35'),
(82, 'P.TARNTHIP', '1942', '1002', NULL, 'employee', '2025-09-22 04:22:35'),
(83, 'W.SUREE', '8924', '1003', NULL, 'employee', '2025-09-22 04:22:35'),
(84, 'S.NAWAPORN', '1856', '1004', NULL, 'employee', '2025-09-22 04:22:35'),
(85, 'P.KITTIMA', '5840', '1005', NULL, 'employee', '2025-09-22 04:22:35'),
(86, 'D.RUNGNAPA', '7841', '1006', NULL, 'employee', '2025-09-22 04:22:35'),
(87, '111', '111', '1007', NULL, 'employee', '2025-09-22 04:22:35'),
(89, 'S.CHONTICH', '1908', '1008', NULL, 'employee', '2025-09-22 04:22:35'),
(90, 'E.PLOYPRON', '9869', '1009', NULL, 'employee', '2025-09-22 04:22:35'),
(91, 'A.KANOKON', '7723', '1010', NULL, 'employee', '2025-09-22 04:22:35'),
(92, 'S.CHAYANUT', '3417', '1011', NULL, 'employee', '2025-09-22 04:22:35'),
(93, 'OVOCAL(TH)', '8888', '1012', NULL, 'employee', '2025-09-22 04:22:35'),
(94, 'S.PAVITA', '4566', '1013', NULL, 'employee', '2025-09-22 04:22:35'),
(95, 'I.SUWIMON', '9401', '1014', NULL, 'employee', '2025-09-22 04:22:35'),
(96, 'C.ANN', '8513', '1015', NULL, 'employee', '2025-09-22 04:22:35'),
(97, 'T.CHALIDA', '6684', '1016', NULL, 'employee', '2025-09-22 04:22:35'),
(98, 'C.SASITORN', '709', '1017', NULL, 'employee', '2025-09-22 04:22:35'),
(99, 'P.WISIT', '3311', '1018', NULL, 'employee', '2025-09-22 04:22:35'),
(100, 'Y.YUPAWADE', '8399', '1019', NULL, 'employee', '2025-09-22 04:22:35'),
(101, '?J.SAROCHA', '3074', '1020', NULL, 'employee', '2025-09-22 04:22:35'),
(102, 'M.SUREERAT', '6119', '1021', NULL, 'employee', '2025-09-22 04:22:35'),
(103, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0001', '2025-10-15', 'admin', '2025-10-15 03:03:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
-- (ถ้า index มีอยู่แล้วจะข้ามไป)
--
-- เพิ่ม PRIMARY KEY (ถ้ายังไม่มี)
SET @sql = IF((SELECT COUNT(*) FROM information_schema.table_constraints 
               WHERE table_schema = DATABASE() 
               AND table_name = 'users' 
               AND constraint_type = 'PRIMARY KEY') = 0,
              'ALTER TABLE `users` ADD PRIMARY KEY (`id`)',
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- เพิ่ม UNIQUE KEY operator (ถ้ายังไม่มี)
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'users' 
               AND index_name = 'operator') = 0,
              'ALTER TABLE `users` ADD UNIQUE KEY `operator` (`operator`)',
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- เพิ่ม UNIQUE KEY pn_id (ถ้ายังไม่มี)
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'users' 
               AND index_name = 'pn_id') = 0,
              'ALTER TABLE `users` ADD UNIQUE KEY `pn_id` (`pn_id`)',
              'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

-- เปิดการตรวจสอบ foreign key กลับมา
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
