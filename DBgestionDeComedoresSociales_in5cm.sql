drop database if exists dbgestiondecomedoressociales_in5cm;
create database dbgestiondecomedoressociales_in5cm;
use dbgestiondecomedoressociales_in5cm;

create table roles(
    id_rol int auto_increment not null,
    nombre_rol varchar(45) not null,
    primary key (id_rol)
);

create table categorias(
    id_categoria int auto_increment not null,
    nombre_categoria varchar(45) not null,
    primary key (id_categoria)
);

create table login(
    id_login int auto_increment not null,
    correo_login varchar(50) not null,
    usuario_login varchar(30) not null unique,
    contrasena_login varchar(255) not null,
    id_rol int not null,
    primary key (id_login),
    constraint fk_login_roles foreign key (id_rol) references roles(id_rol)
);

create table personal(
    id_personal int auto_increment not null,
    nombre_personal varchar(45) not null,
    apellido_personal varchar(45) not null,
    estado_personal varchar(20) not null,
    id_login int not null,
    primary key (id_personal),
    constraint fk_personal_login foreign key (id_login) references login(id_login) on delete cascade
);

create table donantes(
    id_donante int auto_increment not null,
    nombre_donante varchar(45) not null,
    tipo_donante varchar(45),
    telefono_donante varchar(15),
    id_login int,
    primary key (id_donante),
    constraint fk_donante_login foreign key (id_login) references login(id_login)
);

create table inventario(
    id_producto int auto_increment not null,
    id_categoria int not null,
    nombre_producto varchar(60) not null,
    cantidad_actual decimal(10,2) default 0.00,
    unidad_medida varchar(20) not null,
    stock_minimo decimal(10,2) default 5.00,
    fecha_vencimiento date not null,
    primary key (id_producto),
    constraint fk_inventario_categoria foreign key (id_categoria) references categorias(id_categoria)
);

create table movimientosinventario(
    id_movimiento int auto_increment not null,
    id_producto int not null,
    id_personal int not null,
    tipo_movimiento varchar(20) not null,
    cantidad decimal(10,2) not null,
    fecha_movimiento datetime default now(),
    comentario text,
    primary key (id_movimiento),
    constraint fk_mov_producto foreign key (id_producto) references inventario(id_producto),
    constraint fk_mov_personal foreign key (id_personal) references personal(id_personal)
);

create table promesas_donacion(
    id_promesa int auto_increment primary key,
    id_donante int not null,
    descripcion_producto varchar(100) not null,
    cantidad decimal(10,2) not null,
    unidad_medida varchar(20) not null,
    estado varchar(20) default 'pendiente',
    fecha_promesa datetime default now(),
    foreign key (id_donante) references donantes(id_donante)
);

delimiter $$

create procedure sp_agregarcategoria(in p_nombre varchar(45))
begin
    insert into categorias(nombre_categoria) values (p_nombre);
end$$

create procedure sp_listarcategorias()
begin
    select * from categorias;
end$$

create procedure sp_buscarcategoriaporid(in p_id int)
begin
    select * from categorias where id_categoria = p_id;
end$$

create procedure sp_actualizarcategoria(in p_id int, in p_nombre varchar(45))
begin
    update categorias set nombre_categoria = p_nombre where id_categoria = p_id;
end$$

create procedure sp_eliminarcategoria(in p_id int)
begin
    delete from categorias where id_categoria = p_id;
end$$

create procedure sp_agregarproducto(
    in p_id_cat int, in p_nombre varchar(60), in p_unidad varchar(20), in p_minimo decimal(10,2), in p_vencimiento date
)
begin
    insert into inventario(id_categoria, nombre_producto, unidad_medida, stock_minimo, fecha_vencimiento)
    values (p_id_cat, p_nombre, p_unidad, p_minimo, p_vencimiento);
end$$

create procedure sp_listarinventario()
begin
    select * from inventario;
end$$

create procedure sp_buscarproductoporid(in p_id int)
begin
    select * from inventario where id_producto = p_id;
end$$

create procedure sp_actualizarproducto(
    in p_id int, in p_nombre varchar(60), in p_minimo decimal(10,2), in p_vencimiento date
)
begin
    update inventario set nombre_producto = p_nombre, stock_minimo = p_minimo, fecha_vencimiento = p_vencimiento 
    where id_producto = p_id;
end$$

create procedure sp_eliminarproducto(in p_id int)
begin
    delete from inventario where id_producto = p_id;
end$$

create procedure sp_agregarpersonal(
    in p_correo varchar(50), in p_usuario varchar(30), in p_pass varchar(255), 
    in p_rol int, in p_nombre varchar(45), in p_apellido varchar(45), in p_estado varchar(20)
)
begin
    insert into login(correo_login, usuario_login, contrasena_login, id_rol)
    values (p_correo, p_usuario, p_pass, p_rol);
    insert into personal(nombre_personal, apellido_personal, estado_personal, id_login)
    values (p_nombre, p_apellido, p_estado, last_insert_id());
end$$

create procedure sp_listarpersonal()
begin
    select p.*, l.usuario_login, l.correo_login from personal p 
    inner join login l on p.id_login = l.id_login;
end$$

create procedure sp_buscarpersonalporid(in p_id int)
begin
    select * from personal where id_personal = p_id;
end$$

create procedure sp_agregardonante(
    in p_nombre varchar(45), in p_tipo varchar(45), in p_tel varchar(15), in p_login int
)
begin
    insert into donantes(nombre_donante, tipo_donante, telefono_donante, id_login)
    values (p_nombre, p_tipo, p_tel, p_login);
end$$

create procedure sp_listardonantes()
begin
    select * from donantes;
end$$

create procedure sp_actualizardonante(
    in p_id int, in p_nombre varchar(45), in p_tipo varchar(45), in p_tel varchar(15)
)
begin
    update donantes set nombre_donante = p_nombre, tipo_donante = p_tipo, telefono_donante = p_tel 
    where id_donante = p_id;
end$$

create procedure sp_registrarmovimiento(
    in p_id_prod int, 
    in p_id_pers int, 
    in p_tipo varchar(20), 
    in p_cant decimal(10,2), 
    in p_comentario text
)
begin
    insert into movimientosinventario(id_producto, id_personal, tipo_movimiento, cantidad, comentario)
    values (p_id_prod, p_id_pers, p_tipo, p_cant, p_comentario);

    if p_tipo = 'entrada' then
        update inventario set cantidad_actual = cantidad_actual + p_cant 
        where id_producto = p_id_prod;
    elseif p_tipo = 'salida' then
        update inventario set cantidad_actual = cantidad_actual - p_cant 
        where id_producto = p_id_prod;
    end if;
end$$

create procedure sp_autenticarusuario(
    in p_usuario varchar(30),
    in p_contrasena varchar(255)
)
begin
    select l.id_login, l.usuario_login, l.correo_login, l.id_rol, r.nombre_rol,
           p.id_personal, d.id_donante
    from login l
    inner join roles r on l.id_rol = r.id_rol
    left join personal p on l.id_login = p.id_login
    left join donantes d on l.id_login = d.id_login
    where l.usuario_login = p_usuario and l.contrasena_login = p_contrasena;
end$$

create procedure sp_reportebajostock()
begin
    select id_producto, nombre_producto, cantidad_actual, stock_minimo 
    from inventario 
    where cantidad_actual <= stock_minimo;
end$$

create procedure sp_reporteproximosvencer()
begin
    select id_producto, nombre_producto, fecha_vencimiento 
    from inventario 
    where fecha_vencimiento between curdate() and date_add(curdate(), interval 30 day);
end$$

create procedure sp_historialmovimientos()
begin
    select m.tipo_movimiento, m.cantidad, m.fecha_movimiento, i.nombre_producto,
           concat(p.nombre_personal, ' ', p.apellido_personal) as responsable
    from movimientosinventario m
    inner join inventario i on m.id_producto = i.id_producto
    inner join personal p on m.id_personal = p.id_personal
    order by m.fecha_movimiento desc;
end$$

create procedure sp_crearpromesadonacion(
    in p_id_donante int,
    in p_descripcion varchar(100),
    in p_cantidad decimal(10,2),
    in p_unidad varchar(20)
)
begin
    insert into promesas_donacion(id_donante, descripcion_producto, cantidad, unidad_medida)
    values (p_id_donante, p_descripcion, p_cantidad, p_unidad);
end$$

create procedure sp_listarpromesaspordonante(in p_id_donante int)
begin
    select * from promesas_donacion where id_donante = p_id_donante;
end$$

create procedure sp_procesarpromesadonacion(
    in p_id_promesa int,
    in p_id_producto int,
    in p_id_personal int,
    in p_estado varchar(20)
)
begin
    declare v_cant decimal(10,2);
    
    select cantidad into v_cant from promesas_donacion where id_promesa = p_id_promesa;
    
    if p_estado = 'recibida' then
        insert into movimientosinventario(id_producto, id_personal, tipo_movimiento, cantidad, comentario)
        values (p_id_producto, p_id_personal, 'entrada', v_cant, 'Donación recibida');
        
        update inventario set cantidad_actual = cantidad_actual + v_cant where id_producto = p_id_producto;
    end if;
    
    update promesas_donacion set estado = p_estado where id_promesa = p_id_promesa;
end$$

delimiter ;

insert into roles (nombre_rol) values ('admin'), ('almacenista'), ('donante');

-- Categorías
call sp_agregarcategoria('granos básicos');
call sp_agregarcategoria('lácteos');
call sp_agregarcategoria('carnes');
call sp_agregarcategoria('verduras');
call sp_agregarcategoria('frutas');
call sp_agregarcategoria('bebidas');

-- Personal (Admin y Almacenista)
call sp_agregarpersonal('admin@comedor.org', 'admin01', 'Admin123', 1, 'Ana', 'López', 'activo');
call sp_agregarpersonal('almacen@comedor.org', 'almacen01', 'Alma123', 2, 'Carlos', 'Pérez', 'activo');
call sp_agregarpersonal('juan@comedor.org', 'juanperez', 'Juan123', 2, 'Juan', 'Pérez', 'activo');
call sp_agregarpersonal('maria@comedor.org', 'maria123', 'Maria123', 2, 'María', 'García', 'activo');

-- Donantes (con login)
-- Donante 1
insert into login (correo_login, usuario_login, contrasena_login, id_rol) 
values ('donante1@gmail.com', 'donante01', 'Donante123', 3);
insert into donantes (nombre_donante, tipo_donante, telefono_donante, id_login) 
values ('Pedro Jiménez', 'particular', '55510001', last_insert_id());

-- Donante 2
insert into login (correo_login, usuario_login, contrasena_login, id_rol) 
values ('donante2@yahoo.com', 'donante02', 'Donante456', 3);
insert into donantes (nombre_donante, tipo_donante, telefono_donante, id_login) 
values ('Luisa Fernández', 'empresa', '55510002', last_insert_id());

-- Donante 3 (sin login)
insert into donantes (nombre_donante, tipo_donante, telefono_donante, id_login) 
values ('Roberto Gómez', 'particular', '55510003', null);

-- Productos
call sp_agregarproducto(1, 'Arroz', 'libras', 5.00, '2025-12-01');
call sp_agregarproducto(1, 'Frijol negro', 'libras', 3.00, '2025-11-15');
call sp_agregarproducto(1, 'Maíz', 'libras', 4.00, '2025-10-20');
call sp_agregarproducto(2, 'Leche', 'litros', 2.00, '2025-09-10');
call sp_agregarproducto(2, 'Queso', 'libras', 1.00, '2025-08-25');
call sp_agregarproducto(3, 'Pollo', 'libras', 2.00, '2025-07-30');
call sp_agregarproducto(3, 'Res', 'libras', 1.00, '2025-06-15');
call sp_agregarproducto(4, 'Tomate', 'libras', 1.00, '2025-05-20');
call sp_agregarproducto(4, 'Cebolla', 'libras', 1.00, '2025-04-10');
call sp_agregarproducto(5, 'Manzana', 'libras', 1.00, '2025-03-15');
call sp_agregarproducto(6, 'Jugo', 'litros', 3.00, '2025-02-28');

-- Movimientos (entradas)
call sp_registrarmovimiento(1, 1, 'entrada', 100.00, 'Donación mensual - Comedor Central');
call sp_registrarmovimiento(2, 2, 'entrada', 80.00, 'Compra semanal - Proveedor Don Pepe');
call sp_registrarmovimiento(3, 3, 'entrada', 60.00, 'Donación de la iglesia');
call sp_registrarmovimiento(4, 2, 'entrada', 40.00, 'Compra de lácteos');
call sp_registrarmovimiento(5, 4, 'entrada', 30.00, 'Donación de queso');
call sp_registrarmovimiento(6, 1, 'entrada', 50.00, 'Donación de pollo');
call sp_registrarmovimiento(7, 3, 'entrada', 20.00, 'Carne de res comprada');

-- Movimientos (salidas)
call sp_registrarmovimiento(1, 1, 'salida', 15.00, 'Uso en cocina - Comedor 1');
call sp_registrarmovimiento(2, 2, 'salida', 10.00, 'Uso en cocina - Comedor 2');
call sp_registrarmovimiento(3, 3, 'salida', 5.00, 'Uso en cocina - Comedor 3');
call sp_registrarmovimiento(4, 2, 'salida', 8.00, 'Desayuno diario');
call sp_registrarmovimiento(6, 1, 'salida', 12.00, 'Comida especial');

-- Promesas de donación
insert into promesas_donacion (id_donante, descripcion_producto, cantidad, unidad_medida, estado, fecha_promesa) 
values (1, 'Arroz', 50.00, 'libras', 'pendiente', now());

insert into promesas_donacion (id_donante, descripcion_producto, cantidad, unidad_medida, estado, fecha_promesa) 
values (2, 'Leche', 30.00, 'litros', 'recibida', date_sub(now(), interval 2 day));

insert into promesas_donacion (id_donante, descripcion_producto, cantidad, unidad_medida, estado, fecha_promesa) 
values (3, 'Frijol', 40.00, 'libras', 'pendiente', date_sub(now(), interval 1 day));

insert into promesas_donacion (id_donante, descripcion_producto, cantidad, unidad_medida, estado, fecha_promesa) 
values (1, 'Pollo', 25.00, 'libras', 'rechazada', date_sub(now(), interval 3 day));

select * from personal;
select * from login;
select * from categorias;