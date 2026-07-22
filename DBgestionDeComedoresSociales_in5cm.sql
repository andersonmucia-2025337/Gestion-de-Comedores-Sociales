drop database if exists dbgestiondecomedoressociales_in5cm;
create database dbgestiondecomedoressociales_in5cm;
use dbgestiondecomedoressociales_in5cm;

-- ////////////////////////----tablas----///////////////////////

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

-- ////////////////////////----procedimientos almacenados (sp)----///////////////////////

delimiter $$

-- sp para categorías
create procedure sp_agregarcategoria(in p_nombre varchar(45))
begin
    insert into categorias(nombre_categoria) values (p_nombre);
end $$

create procedure sp_listarcategorias()
begin
    select * from categorias;
end $$

create procedure sp_buscarcategoriaporid(in p_id int)
begin
    select * from categorias where id_categoria = p_id;
end $$

create procedure sp_actualizarcategoria(in p_id int, in p_nombre varchar(45))
begin
    update categorias set nombre_categoria = p_nombre where id_categoria = p_id;
end $$

create procedure sp_eliminarcategoria(in p_id int)
begin
    delete from categorias where id_categoria = p_id;
end $$

-- sp para inventario
create procedure sp_agregarproducto(
    in p_id_cat int, in p_nombre varchar(60), in p_unidad varchar(20), in p_minimo decimal(10,2), in p_vencimiento date
)
begin
    insert into inventario(id_categoria, nombre_producto, unidad_medida, stock_minimo, fecha_vencimiento)
    values (p_id_cat, p_nombre, p_unidad, p_minimo, p_vencimiento);
end $$

create procedure sp_listarinventario()
begin
    select * from inventario;
end $$

create procedure sp_buscarproductoporid(in p_id int)
begin
    select * from inventario where id_producto = p_id;
end $$

create procedure sp_actualizarproducto(
    in p_id int, in p_nombre varchar(60), in p_minimo decimal(10,2), in p_vencimiento date
)
begin
    update inventario set nombre_producto = p_nombre, stock_minimo = p_minimo, fecha_vencimiento = p_vencimiento 
    where id_producto = p_id;
end $$

create procedure sp_eliminarproducto(in p_id int)
begin
    delete from inventario where id_producto = p_id;
end $$

create procedure sp_agregarpersonal(
    in p_correo varchar(50), in p_usuario varchar(30), in p_pass varchar(255), 
    in p_rol int, in p_nombre varchar(45), in p_apellido varchar(45), in p_estado varchar(20)
)
begin
    insert into login(correo_login, usuario_login, contrasena_login, id_rol)
    values (p_correo, p_usuario, p_pass, p_rol);
    insert into personal(nombre_personal, apellido_personal, estado_personal, id_login)
    values (p_nombre, p_apellido, p_estado, last_insert_id());
end $$

create procedure sp_listarpersonal()
begin
    select p.*, l.usuario_login, l.correo_login from personal p 
    inner join login l on p.id_login = l.id_login;
end $$

create procedure sp_buscarpersonalporid(in p_id int)
begin
    select * from personal where id_personal = p_id;
end $$

-- sp para donantes
create procedure sp_agregardonante(
    in p_nombre varchar(45), in p_tipo varchar(45), in p_tel varchar(15), in p_login int
)
begin
    insert into donantes(nombre_donante, tipo_donante, telefono_donante, id_login)
    values (p_nombre, p_tipo, p_tel, p_login);
end $$

create procedure sp_listardonantes()
begin
    select * from donantes;
end $$

create procedure sp_actualizardonante(
    in p_id int, in p_nombre varchar(45), in p_tipo varchar(45), in p_tel varchar(15)
)
begin
    update donantes set nombre_donante = p_nombre, tipo_donante = p_tipo, telefono_donante = p_tel 
    where id_donante = p_id;
end $$

-- sp para registrar movimientos (reemplaza la lógica del trigger)
create procedure sp_registrarmovimiento(
    in p_id_prod int, 
    in p_id_pers int, 
    in p_tipo varchar(20), 
    in p_cant decimal(10,2), 
    in p_comentario text
)
begin
    -- 1. insertar el registro del movimiento
    insert into movimientosinventario(id_producto, id_personal, tipo_movimiento, cantidad, comentario)
    values (p_id_prod, p_id_pers, p_tipo, p_cant, p_comentario);

    -- 2. actualizar el stock manualmente según el tipo
    if p_tipo = 'entrada' then
        update inventario set cantidad_actual = cantidad_actual + p_cant 
        where id_producto = p_id_prod;
    elseif p_tipo = 'salida' then
        update inventario set cantidad_actual = cantidad_actual - p_cant 
        where id_producto = p_id_prod;
    end if;
end $$

delimiter ;

-- ////////////////////////----inserción de datos con sp----///////////////////////

insert into roles (nombre_rol) values ('admin'), ('almacenista'), ('donante');

call sp_agregarcategoria('granos básicos');
call sp_agregarpersonal('admin@comedor.org', 'admin01', 'hash123', 1, 'ana', 'lópez', 'activo');
call sp_agregarproducto(1, 'arroz', 'libras', 5.00, '2025-12-01');

call sp_registrarmovimiento(1, 1, 'entrada', 100.00, 'donación mensual');

call sp_registrarmovimiento(1, 1, 'salida', 15.00, 'uso en cocina');

select * from inventario;
select * from personal;
select * from movimientosinventario;