import { pool } from "../data/db";
import { CategoriaService } from "./categoriaService";
import { ProductoService } from "./productoService";
import { PersonalService } from "./personalService";
import { DonanteService } from "./donanteService";
import { MovimientoService } from "./movimientoService";
import { PromesaService } from "./promesaService";
import { AuthService } from "./authService";
import { ReporteService } from "./reporteService";

const categoriaService = new CategoriaService();
const productoService = new ProductoService();
const personalService = new PersonalService();
const donanteService = new DonanteService();
const movimientoService = new MovimientoService();
const promesaService = new PromesaService();
const authService = new AuthService();
const reporteService = new ReporteService();

export const comedorService = {
  iniciarSesion: authService.iniciarSesion.bind(authService),
  registrarUsuarioHibrido: authService.registrarUsuarioHibrido.bind(authService),
  validarCorreo: authService.validarCorreo.bind(authService),

  agregarCategoria: categoriaService.agregar.bind(categoriaService),
  listarCategorias: categoriaService.listar.bind(categoriaService),
  buscarCategoriaPorId: categoriaService.buscarPorId.bind(categoriaService),
  buscarCategoriaPorIdConValidacion: categoriaService.buscarPorIdConValidacion.bind(categoriaService),
  actualizarCategoria: categoriaService.actualizar.bind(categoriaService),
  eliminarCategoria: categoriaService.eliminar.bind(categoriaService),

  agregarProducto: productoService.agregar.bind(productoService),
  listarInventario: productoService.listar.bind(productoService),
  buscarProductoPorId: productoService.buscarPorId.bind(productoService),
  buscarProductoPorIdConValidacion: productoService.buscarPorIdConValidacion.bind(productoService),
  actualizarProducto: productoService.actualizar.bind(productoService),
  eliminarProducto: productoService.eliminar.bind(productoService),

  agregarPersonal: personalService.agregar.bind(personalService),
  listarPersonal: personalService.listar.bind(personalService),
  buscarPersonalPorId: personalService.buscarPorId.bind(personalService),
  buscarPersonalPorIdConValidacion: personalService.buscarPorIdConValidacion.bind(personalService),
  actualizarPersonal: personalService.actualizar.bind(personalService),
  eliminarPersonal: personalService.eliminar.bind(personalService),

  listarDonantes: donanteService.listar.bind(donanteService),
  buscarDonantePorId: donanteService.buscarPorId.bind(donanteService),
  buscarDonantePorIdConValidacion: donanteService.buscarPorIdConValidacion.bind(donanteService),
  agregarDonante: donanteService.agregar.bind(donanteService),
  actualizarDonante: donanteService.actualizar.bind(donanteService),
  eliminarDonante: donanteService.eliminar.bind(donanteService),

  registrarMovimiento: movimientoService.registrar.bind(movimientoService),
  listarHistorialMovimientos: movimientoService.listarHistorial.bind(movimientoService),
  buscarMovimientoPorId: movimientoService.buscarPorId.bind(movimientoService),
  buscarMovimientoPorIdConValidacion: movimientoService.buscarPorIdConValidacion.bind(movimientoService),
  actualizarMovimiento: movimientoService.actualizar.bind(movimientoService),
  eliminarMovimiento: movimientoService.eliminar.bind(movimientoService),

  registrarPromesa: promesaService.registrar.bind(promesaService),
  listarPromesasPorDonante: promesaService.listarPorDonante.bind(promesaService),
  listarTodasPromesas: promesaService.listarTodas.bind(promesaService),
  buscarPromesaPorId: promesaService.buscarPorId.bind(promesaService),
  buscarPromesaPorIdConValidacion: promesaService.buscarPorIdConValidacion.bind(promesaService),
  actualizarPromesa: promesaService.actualizar.bind(promesaService),
  eliminarPromesa: promesaService.eliminar.bind(promesaService),
  procesarPromesaDonacion: promesaService.procesar.bind(promesaService),

  reporteBajoStock: reporteService.bajoStock.bind(reporteService),
  reporteProximosVencer: reporteService.proximosVencer.bind(reporteService),

  existeCategoria: categoriaService.existe.bind(categoriaService),
  existeProducto: productoService.existe.bind(productoService),
  existePersonal: personalService.existe.bind(personalService),
  existeDonante: donanteService.existe.bind(donanteService),
  existePromesa: promesaService.existe.bind(promesaService),
  existeRol: personalService.existeRol.bind(personalService),
  existeProductoEnCategoria: async (id: number) => {
    const [rows] = await pool.query("SELECT id_producto FROM inventario WHERE id_categoria = ?", [id]);
    return (rows as any[]).length > 0;
  },
  existeMovimientoConProducto: productoService.existeMovimientoConProducto.bind(productoService),
  existePromesaConDonante: donanteService.existePromesaConDonante.bind(donanteService),
  existeMovimiento: movimientoService.existe.bind(movimientoService),
};