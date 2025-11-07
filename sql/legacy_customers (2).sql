-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2025 at 06:23 AM
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
-- Table structure for table `legacy_customers`
-- Table already exists, skipping CREATE TABLE statement
--

-- CREATE TABLE `legacy_customers` (
--   `id` bigint(20) UNSIGNED NOT NULL,
--   `workdate` date DEFAULT NULL,
--   `worktime` varchar(8) DEFAULT NULL,
--   `operator` varchar(10) DEFAULT NULL,
--   `customerid` varchar(10) DEFAULT NULL,
--   `date` date DEFAULT NULL,
--   `source` smallint(6) DEFAULT NULL,
--   `salerepid` varchar(6) DEFAULT NULL,
--   `idtype` varchar(2) DEFAULT NULL,
--   `prename` varchar(20) DEFAULT NULL,
--   `firstname` text DEFAULT NULL,
--   `lastname` text DEFAULT NULL,
--   `nickname` varchar(20) DEFAULT NULL,
--   `comname` text DEFAULT NULL,
--   `birthday` date DEFAULT NULL,
--   `age` smallint(6) DEFAULT NULL,
--   `weight` smallint(6) DEFAULT NULL,
--   `height` smallint(6) DEFAULT NULL,
--   `sex` varchar(1) DEFAULT NULL,
--   `work` varchar(1) DEFAULT NULL,
--   `homenum` text DEFAULT NULL,
--   `moo` varchar(5) DEFAULT NULL,
--   `building` text DEFAULT NULL,
--   `soi` text DEFAULT NULL,
--   `road` text DEFAULT NULL,
--   `kate` text DEFAULT NULL,
--   `kwang` text DEFAULT NULL,
--   `provcode` smallint(6) DEFAULT NULL,
--   `addr1` text DEFAULT NULL,
--   `addr2` text DEFAULT NULL,
--   `addr3` text DEFAULT NULL,
--   `addr4` text DEFAULT NULL,
--   `addr5` text DEFAULT NULL,
--   `province` varchar(20) DEFAULT NULL,
--   `zipcode` varchar(5) DEFAULT NULL,
--   `mobiletel` varchar(11) DEFAULT NULL,
--   `officetel` varchar(11) DEFAULT NULL,
--   `officeext` varchar(6) DEFAULT NULL,
--   `hometel` varchar(11) DEFAULT NULL,
--   `homeext` varchar(6) DEFAULT NULL,
--   `fax` varchar(11) DEFAULT NULL,
--   `email` text DEFAULT NULL,
--   `media` text DEFAULT NULL,
--   `channel` text DEFAULT NULL,
--   `remark1` text DEFAULT NULL,
--   `remark2` text DEFAULT NULL,
--   `signdate` date DEFAULT NULL,
--   `emailaddr` text DEFAULT NULL,
--   `sickness1` text DEFAULT NULL,
--   `sickness2` text DEFAULT NULL,
--   `custtag` text DEFAULT NULL,
--   `lineid` text DEFAULT NULL,
--   `baned` tinyint(1) DEFAULT NULL,
--   `banremark` text DEFAULT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `legacy_customers`
--

INSERT INTO `legacy_customers` (`id`, `workdate`, `worktime`, `operator`, `customerid`, `date`, `source`, `salerepid`, `idtype`, `prename`, `firstname`, `lastname`, `nickname`, `comname`, `birthday`, `age`, `weight`, `height`, `sex`, `work`, `homenum`, `moo`, `building`, `soi`, `road`, `kate`, `kwang`, `provcode`, `addr1`, `addr2`, `addr3`, `addr4`, `addr5`, `province`, `zipcode`, `mobiletel`, `officetel`, `officeext`, `hometel`, `homeext`, `fax`, `email`, `media`, `channel`, `remark1`, `remark2`, `signdate`, `emailaddr`, `sickness1`, `sickness2`, `custtag`, `lineid`, `baned`, `banremark`) VALUES
(7, '0000-00-00', '18:15:46', 'A.KANOKON', '0000053463', '0000-00-00', 5, '880', '', 'คุณ', 'โสรยา', 'อรุณวิไลรัตน์', '', '', '0000-00-00', 0, 0, 0, 'F', '', '74/12', '12', '', '', 'ชัยภูมิ-สีคิ้ว', 'จัตุรัส', 'บ้านกอก', 0, 'คุณโสรยา อรุณวิไลรัตน์', '74/12 ม.12 ถ.ชัยภูมิ-สีคิ้ว', 'ตำบลบ้านกอก อำเภอจัตุรัส', 'จังหวัดชัยภูมิ 36130', '', 'ชัยภูมิ', '36130', '0816601105', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(8, '0000-00-00', '7:41:38', 'A.KANOKON', '0000053464', '0000-00-00', 5, '1007', '', 'คุณ', 'รัชณี', 'ถือทอง', '', '', '0000-00-00', 65, 82, 165, 'F', '', '67/1', '3', '', '', '', 'เกาะสมุย', 'ลิปะน้อย', 0, 'คุณรัชณี ถือทอง', '67/1 ม.3', 'ตำบลลิปะน้อย อำเภอเกาะสมุย', 'จังหวัดสุราษฎร์ธานี 84140', '', 'สุราษฎร์ธานี', '84140', '0897943658', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', 'น้ำหนักเกินเกณฑ์', 'LINE S:rutchanee', 0, ''),
(9, '0000-00-00', '8:12:47', 'A.KANOKON', '0000053465', '0000-00-00', 5, '880', '', 'คุณ', 'เปี่ยมบุญ', 'ตรีคันธา', '', '', '0000-00-00', 0, 0, 0, 'F', '', '9', '', '', 'พัฒนาการ 11', 'พัฒนาการ', 'สวนหลวง', 'สวนหลวง', 0, 'คุณเปี่ยมบุญ ตรีคันธา', '9 ซ.พัฒนาการ 11 ถ.พัฒนาการ', 'แขวงสวนหลวง เขตสวนหลวง', 'กทม. 10250', '', 'กทม.', '10250', '0868991515', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(10, '0000-00-00', '8:17:36', 'A.KANOKON', '0000053466', '0000-00-00', 5, '880', '', 'คุณ', 'พนิตสินี', 'บุญทอง', '', '', '0000-00-00', 0, 0, 0, 'F', '', '299', '2', '', '', '', 'สิเกา', 'บ่อหิน', 0, 'คุณพนิตสินี บุญทอง', '299 ม.2', 'ตำบลบ่อหิน อำเภอสิเกา', 'จังหวัดตรัง 92150', '', 'ตรัง', '92150', '0642326355', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(11, '0000-00-00', '8:21:45', 'A.KANOKON', '0000053467', '0000-00-00', 5, '880', '', 'คุณ', 'ปทุมภรณ์', 'สุทธิชูจิต', '', '', '0000-00-00', 0, 0, 0, 'F', '', '114/58', '6', 'มบ.พฤกษา นารา-โรจนะ สามเรือน', '3', 'โรจนะ', 'บางปะอิน', 'สามเรือน', 0, 'คุณปทุมภรณ์ สุทธิชูจิต', '114/58 ม.6 มบ.พฤกษา นารา-โรจนะ สามเรือน ซ.3 ถ.โรจนะ', 'ตำบลสามเรือน อำเภอบางปะอิน', 'จังหวัดพระนครศรีอยุธยา 13160', '', 'พระนครศรีอยุธยา', '13160', '0855545156', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(12, '0000-00-00', '8:24:49', 'A.KANOKON', '0000053468', '0000-00-00', 5, '880', '', 'คุณ', 'จิตรกร', 'ยิ่งวิริยะ', '', '', '0000-00-00', 0, 0, 0, 'F', '', '180/2', '', 'มบ.สัมมากร', 'รามคำแหง 110', 'รามคำแหง', 'สะพานสูง', 'สะพานสูง', 0, 'คุณจิตรกร ยิ่งวิริยะ', '180/2 มบ.สัมมากร ซ.รามคำแหง 110 ถ.รามคำแหง', 'แขวงสะพานสูง เขตสะพานสูง', 'กทม. 10240', '', 'กทม.', '10240', '0652615456', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(13, '0000-00-00', '8:28:28', 'A.KANOKON', '0000053469', '0000-00-00', 5, '880', '', 'คุณ', 'ณัฐนรี', 'วีระชัยสันติกุล', '', '', '0000-00-00', 0, 0, 0, 'F', '', '189/80', '3', 'มบ.พฤกษา56 (ร่มเย็น)', '4', '', 'พระสมุทรเจดีย์', 'ในคลองบางปลากด', 0, 'คุณณัฐนรี วีระชัยสันติกุล', '189/80 ม.3 มบ.พฤกษา56 (ร่มเย็น) ซ.4', 'ตำบลในคลองบางปลากด อำเภอพระสมุทรเจดีย์', 'จังหวัดสมุทรปราการ 10290', '', 'สมุทรปราการ', '10290', '0965456746', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(14, '0000-00-00', '11:22:51', 'A.KANOKON', '0000053470', '0000-00-00', 5, '1013', '', 'คุณ', 'สุจิตรา', 'สกุลเลิศศิรนันท์', '', '', '0000-00-00', 54, 63, 167, 'F', '', '55/41', '', 'เมืองเอกโครงการ6', 'เอกเจริญ 12', '', 'เมือง', 'หลักหก', 0, 'คุณสุจิตรา สกุลเลิศศิรนันท์', '55/41 เมืองเอกโครงการ6 ซ.เอกเจริญ 12', 'ตำบลหลักหก อำเภอเมือง', 'จังหวัดปทุมธานี 12000', '', 'ปทุมธานี', '12000', '0611495119', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', 'LINE O: Sujitra', 0, ''),
(15, '0000-00-00', '12:52:00', 'A.KANOKON', '0000053471', '0000-00-00', 5, '1007', '', 'คุณ', 'ศรัณยา', 'แป้นถึง', '', '', '0000-00-00', 47, 52, 163, 'F', '', '279/101', '', 'ม.ไอดีไซน์วิภาวดี', '', 'วิภาวดีรังสิต', 'ดอนเมือง', 'สนามบิน', 0, 'คุณศรัณยา แป้นถึง', '279/101 ม.ไอดีไซน์วิภาวดี ถ.วิภาวดีรังสิต', 'แขวงสนามบิน เขตดอนเมือง', 'กทม. 10210', '', 'กทม.', '10210', '0817017603', '', '', '', '', '', '', '', '', '', '', '0000-00-00', 'saranya15@hotmail.com', '', '', '', 'Line s : Ead echo~s', 0, ''),
(16, '0000-00-00', '10:31:25', 'A.KANOKON', '0000053472', '0000-00-00', 5, '880', '', 'คุณ', 'ชล', 'มุ่งถิ่น', '', '', '0000-00-00', 0, 0, 0, 'M', '', '56/2', '15', 'มบ.บ้านท่าตาแป้น', '', '', 'บ้านคา', 'บ้านคา', 0, 'คุณชล มุ่งถิ่น', '56/2 ม.15 มบ.บ้านท่าตาแป้น', 'ตำบลบ้านคา อำเภอบ้านคา', 'จังหวัดราชบุรี 70180', '', 'ราชบุรี', '70180', '0848740001', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(17, '0000-00-00', '8:20:58', 'A.KANOKON', '0000053473', '0000-00-00', 5, '880', '', 'คุณ', 'วรกูล', 'สัจจะบริบูรณ์', '', '', '0000-00-00', 0, 0, 0, 'M', '', '21/6', '7', '', 'ใต้แรงสูง(สุขสวัสดิ์76/2)', 'สุขสวัสดิ์', 'พระประแดง', 'บางจาก', 0, 'คุณวรกูล สัจจะบริบูรณ์', '21/6 ม.7 ซ.ใต้แรงสูง(สุขสวัสดิ์76/2) ถ.สุขสวัสดิ์', 'ตำบลบางจาก อำเภอพระประแดง', 'จังหวัดสมุทรปราการ 10130', '', 'สมุทรปราการ', '10130', '0851099179', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(18, '0000-00-00', '8:24:20', 'A.KANOKON', '0000053474', '0000-00-00', 5, '880', '', 'คุณ', 'พรคนางค์', 'ปีตาภา', '', '', '0000-00-00', 0, 0, 0, 'F', '', '60/238', '', 'มบ.กฤษดานคร 25', '', '', 'คลองสามวา', 'ทรายกองดิน', 0, 'คุณพรคนางค์ ปีตาภา', '60/238 มบ.กฤษดานคร 25', 'แขวงทรายกองดิน เขตคลองสามวา', 'กทม. 10510', '', 'กทม.', '10510', '0929517428', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, ''),
(19, '0000-00-00', '8:28:12', 'A.KANOKON', '0000053475', '0000-00-00', 5, '880', '', 'คุณ', 'สินีนาถ', 'ชวชาติ', '', '', '0000-00-00', 0, 0, 0, 'F', '', '222/88', '', 'มบ.เอ็มเพอร์เร่อร์1', '', '', 'เมืองเชียงใหม่', 'แม่เหีย', 0, 'คุณสินีนาถ ชวชาติ', '222/88 มบ.เอ็มเพอร์เร่อร์1', 'ตำบลแม่เหีย อำเภอเมืองเชียงใหม่', 'จังหวัดเชียงใหม่ 50100', '', 'เชียงใหม่', '50100', '0641791939', '', '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', 0, '');

--
-- Indexes for dumped tables
-- Indexes already exist, skipping ALTER TABLE statements
--

--
-- Indexes for table `legacy_customers`
--
-- ALTER TABLE `legacy_customers`
--   ADD PRIMARY KEY (`id`),
--   ADD UNIQUE KEY `uniq_legacy_customers_customerid` (`customerid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `legacy_customers`
--
-- ALTER TABLE `legacy_customers`
--   MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
