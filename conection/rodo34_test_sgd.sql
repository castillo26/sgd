-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-03-2026 a las 16:14:43
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `rodo34_test_sgd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id` int(11) NOT NULL,
  `nombre_area` varchar(100) NOT NULL,
  `fecha_registro` date NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas`
--

INSERT INTO `areas` (`id`, `nombre_area`, `fecha_registro`, `estado`) VALUES
(1, 'Administración', '2026-03-09', 1),
(2, 'Contabilidad', '2026-03-09', 1),
(3, 'Gerencia', '2026-03-09', 1),
(4, 'RRHH', '2026-03-09', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `documentos`
--

CREATE TABLE `documentos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `estado` varchar(50) DEFAULT 'enviado',
  `fecha_subida` datetime DEFAULT current_timestamp(),
  `area_origen_id` int(11) DEFAULT NULL,
  `area_destino_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `documentos`
--

INSERT INTO `documentos` (`id`, `nombre`, `archivo`, `usuario_id`, `estado`, `fecha_subida`, `area_origen_id`, `area_destino_id`) VALUES
(1, 'Solicitud de presupuesto', 'uploads/presupuesto.pdf', 1, 'enviado', '2026-03-13 09:07:46', 1, 2),
(2, 'Informe financiero', 'uploads/informe.pdf', 2, 'enviado', '2026-03-13 09:07:46', 2, 3),
(3, 'Contrato laboral', 'uploads/contrato.pdf', 4, 'enviado', '2026-03-13 09:07:46', 4, 1),
(5, 'documento_prueba_contabilidad', 'uploads/1773412695_ACTA SESION EXTRAORDINARIA  27-06-2023.pdf', 1, 'enviado', '2026-03-13 09:38:15', 1, 2),
(6, 'documento_prueba_2', 'uploads/1773413892_ACTA SESION EXTRAORDINARIA 05-04-2023.pdf', 1, 'enviado', '2026-03-13 09:58:12', 0, 0),
(7, 'prueba_contabilidad_2', 'uploads/1773413937_ACTA SESION EXTRAORDINARIA  27-06-2023.pdf', 1, 'enviado', '2026-03-13 09:58:57', 0, 0),
(8, 'prueba_2', 'uploads/1773414096_ACTA SESION EXTRAORDINARIA 05-04-2023.pdf', 1, 'enviado', '2026-03-13 10:01:36', 1, 0),
(9, 'prueba_3', 'uploads/1773414549_ACTA SESION EXTRAORDINARIA 09-03-2023.pdf', 1, 'enviado', '2026-03-13 10:09:09', 1, 0),
(10, 'prueba_4', 'uploads/1773414662_ACTA SESION EXTRAORDINARIA 09-06-2023.pdf', 1, 'enviado', '2026-03-13 10:11:02', 1, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(8) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena` varchar(100) NOT NULL,
  `area` int(11) NOT NULL,
  `estado` int(1) NOT NULL,
  `rol` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `correo`, `contrasena`, `area`, `estado`, `rol`) VALUES
(1, 'admin@gmail.com', '123456', 1, 1, 'admin'),
(2, 'contabilidad@gmail.com', '123456', 2, 1, 'usuario'),
(3, 'gerencia@gmail.com', '123456', 3, 1, 'usuario'),
(4, 'rrhh@gmail.com', '123456', 4, 1, 'usuario');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `documentos`
--
ALTER TABLE `documentos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_usuario_area` (`area`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `documentos`
--
ALTER TABLE `documentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_area` FOREIGN KEY (`area`) REFERENCES `areas` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
