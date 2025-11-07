-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2025 at 06:45 AM
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
-- Table structure for table `shippingmst`
-- Table already exists, skipping CREATE TABLE statement
--

-- CREATE TABLE `shippingmst` (
--   `id` bigint(20) UNSIGNED NOT NULL,
--   `shiptype` varchar(50) DEFAULT NULL,
--   `shipdesc` varchar(255) DEFAULT NULL,
--   `shipcode` varchar(50) NOT NULL,
--   `shiptitle` varchar(255) NOT NULL,
--   `shipprice` decimal(12,2) DEFAULT NULL,
--   `freecode` varchar(50) DEFAULT NULL,
--   `freetitle` varchar(255) DEFAULT NULL,
--   `freeprice` decimal(12,2) DEFAULT NULL,
--   `remark` text DEFAULT NULL,
--   `fingrptype` tinyint(1) DEFAULT NULL COMMENT 'Payment type: 0=เก็บเงินปลายทาง, 1=อื่นๆ'
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `shippingmst`
--

INSERT INTO `shippingmst` (`id`, `shiptype`, `shipdesc`, `shipcode`, `shiptitle`, `shipprice`, `freecode`, `freetitle`, `freeprice`, `remark`, `fingrptype`) VALUES
(22, '1', 'BYHAND', '10821', 'ค่าส่งสินค้า BYHAND', 100.00, '11344', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(23, '2', 'E.M.S', '10822', 'ค่าส่งสินค้า E.M.S.', 100.00, '11345', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(24, '3', 'พกง.', '10823', 'ค่าส่งสินค้า E.M.S.', 100.00, '11346', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(25, '4', 'KERRY EXPRESS', '10824', 'ค่าส่งสินค้า KERRY EXPRESS', 100.00, '11347', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(26, '5', 'DHL', '10825', 'ค่าส่งสินค้า DHL', 100.00, '11348', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(27, '6', 'LineMan', '10826', 'ค่าส่งสินค้า LineMan', 100.00, '11349', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(28, '7', 'Lalamove', '10827', 'ค่าส่งสินค้า Lalamove', 100.00, '11350', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(29, '8', 'Grab', '10828', 'ค่าส่งสินค้า Grab', 100.00, '11351', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(30, '9', 'Shopee', '10829', 'ค่าส่งสินค้า Shopee', 100.00, '11352', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(31, '10', 'LEX EXPRESS', '10830', 'ค่าส่งสินค้า LEX EXPRESS', 100.00, '11353', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(32, '11', 'FLASH EXPRESS', '10831', 'ค่าส่งสินค้า FLASH EXPRESS', 100.00, '11354', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(33, '12', 'J&T EXPRESS', '10832', 'ค่าส่งสินค้า J&T EXPRESS', 100.00, '11355', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(34, '13', 'Kerry COD', '10833', 'ค่าส่งสินค้า Kerry COD', 100.00, '11356', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(35, '14', 'E.M.S. COD', '10834', 'ค่าส่งสินค้า E.M.S. COD', 100.00, '11357', 'ไม่คิดค่าส่ง', 0.00, '', 1),
(36, '15', 'J&T. COD', '10835', 'ค่าส่งสินค้า J&T. COD', 100.00, '11358', 'ไม่คิดค่าส่ง', 0.00, '', 1);

--
-- Indexes for dumped tables
-- Indexes already exist, skipping ALTER TABLE statements
--

--
-- Indexes for table `shippingmst`
--
-- ALTER TABLE `shippingmst`
--   ADD PRIMARY KEY (`id`),
--   ADD UNIQUE KEY `uniq_shippingmst_shipcode` (`shipcode`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `shippingmst`
--
-- ALTER TABLE `shippingmst`
--   MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
