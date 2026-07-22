const URL = "http://localhost:3000/usuarios";

/**
 * Obtener todos los usuarios
 */
export async function obtenerUsuarios(): Promise<void> {

    try {

        const respuesta = await fetch(URL);

        const usuarios = await respuesta.json();

        console.log("\n===== LISTA DE USUARIOS =====");
        console.table(usuarios);

    } catch (error) {

        console.log(error);

    }

}

/**
 * Obtener usuario por ID
 */
export async function obtenerUsuarioPorId(id: number): Promise<void> {

    try {

        const respuesta = await fetch(`${URL}/${id}`);

        const usuario = await respuesta.json();

        console.log(usuario);

    } catch (error) {

        console.log(error);

    }

}

/**
 * Guardar usuario
 */
export async function guardarUsuario(usuario: any): Promise<void> {

    try {

        const respuesta = await fetch(URL, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(usuario)

        });

        const mensaje = await respuesta.json();

        console.log(mensaje);

    } catch (error) {

        console.log(error);

    }

}

/**
 * Actualizar usuario
 */
export async function actualizarUsuario(id: number, usuario: any): Promise<void> {

    try {

        const respuesta = await fetch(`${URL}/${id}`, {

            method: "PUT",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(usuario)

        });

        const mensaje = await respuesta.json();

        console.log(mensaje);

    } catch (error) {

        console.log(error);

    }

}

/**
 * Eliminar usuario
 */
export async function eliminarUsuario(id: number): Promise<void> {

    try {

        const respuesta = await fetch(`${URL}/${id}`, {

            method: "DELETE"

        });

        const mensaje = await respuesta.json();

        console.log(mensaje);

    } catch (error) {

        console.log(error);

    }

}