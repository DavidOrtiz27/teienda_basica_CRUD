-- Estructura de base de datos para una tienda de ropa (sin normalización, todo en una sola tabla)

CREATE SCHEMA tienda_ropa;
USE tienda_ropa;

CREATE TABLE Producto (
    id_producto INTEGER PRIMARY KEY AUTOINCREMENT,
    imagen_url VARCHAR(255) NOT NULL,
    medida VARCHAR(50),
    color VARCHAR(30),
    talla VARCHAR(10),
    categoria VARCHAR(50),
    precio DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL
);


-- Datos de prueba para la tabla Producto

INSERT INTO Producto (imagen_url, medida, color, talla, categoria, precio, stock) VALUES
('sin_imagen', 'M', 'Rojo', 'M', 'Camiseta', 19.99, 50),
('sin_imagen', 'L', 'Azul', 'L', 'Pantalón', 29.99, 30),
('sin_imagen', 'S', 'Negro', 'S', 'Chaqueta', 49.99, 20),
('sin_imagen', 'XL', 'Blanco', 'XL', 'Sudadera', 39.99, 15),
('sin_imagen', 'M', 'Verde', 'M', 'Vestido', 59.99, 10),
('sin_imagen', 'S', 'Amarillo', 'S', 'Falda', 24.99, 25),
('sin_imagen', 'L', 'Gris', 'L', 'Abrigo', 89.99, 5),
('sin_imagen', 'M', 'Azul', 'M', 'Short', 14.99, 40),
('sin_imagen', 'S', 'Rosa', 'S', 'Blusa', 34.99, 18),
('sin_imagen', 'XL', 'Negro', 'XL', 'Jeans', 44.99, 22);