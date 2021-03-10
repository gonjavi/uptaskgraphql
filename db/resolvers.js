const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});

// crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email } = usuario;

  return jwt.sign({ id, email}, secreta, { expiresIn });
}

const resolvers = {
  Query: {
    obtenerProyectos:  async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.usuario.id});

      return proyectos;
    },
    obtenerTareas: async (_, {input}, ctx) => {
      console.log(ctx)
      const tareas = await Tarea.find({ creador: ctx.usuario.id }).where('proyecto').equals(input.proyecto);

      return tareas;
    }

  },
  Mutation: {
    crearUsuario: async (_, {input}) => {
      const { email , password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      if (existeUsuario) {
        throw new Error('El usuario ya existe')
      }

      try {
        // volver hash el password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);
        console.log(input)
        

        // registrar nuevo usuario
        const nuevoUsuario = new Usuario(input);
        console.log(nuevoUsuario)

        nuevoUsuario.save();
        return "Usuario creado correctamente";
      } catch (error) {
        console.log(error)
      }
    },

    autenticarUsuario: async (_, {input}) => {
      const { email, password } = input;

      // si el usuario existe
      const existeUsuario = await Usuario.findOne({ email });

      if (!existeUsuario) {
        throw new Error('El usuario no existe')
      }

      // El password es correcto
      const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)

      if (!passwordCorrecto) {
        throw Error('Password incorrecto');
      }

      // dar acceso a la app
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '7hr')
      }

    },

    nuevoProyecto: async (_, {input}, ctx) => {

      try {
        const proyecto = new Proyecto(input);

        // asociar el creador
        proyecto.creador = ctx.usuario.id;

        // almacenar ne base de datos
        const resultado = await proyecto.save();

        return resultado;

      } catch (error) {
        console.log(error);
      }
    },

    actualizarProyecto: async (_, {id, input}, ctx) => {
      // revisar que proyecto exista
      let proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }

      // revisar que si la persona que trata de editarlo, es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar');
      }

      // guardar el proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true });
      return proyecto;
    },

    eliminarProyecto: async(_, {id}, ctx) => {
       // revisar que proyecto exista
       let proyecto = await Proyecto.findById(id);

       if (!proyecto) {
         throw new Error('Proyecto no encontrado');
       }
 
       // revisar que si la persona que trata de editarlo, es el creador
       if (proyecto.creador.toString() !== ctx.usuario.id) {
         throw new Error('NO tienes las credenciales para editar');
       }

       // Eliminar
       await Proyecto.findOneAndDelete({ _id : id });

       return "Proyecto eliminado";
    },

    nuevaTarea: async (_, {input}, ctx) => {
      try {
        const tarea = new Tarea(input);
        tarea.creador = ctx.usuario.id;
        const resultado = await tarea.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    actualizarTarea: async (_,{ id, input, estado }, ctx) => {
      // Si la tarea existe o no
      let tarea = await Tarea.findById( id );

      if(!tarea) {
        throw new Error('Tarea no encontrada');
      }

      // Si la persona que edita es el creador
      if(tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar');
      }

      // asignar estado
      input.estado = estado;

      // Guardar y retornar la tarea
      tarea = await Tarea.findOneAndUpdate({ _id : id }, input, { new: true});

      return tarea;
    },

    eliminarTarea: async (_, { id }, ctx) => {
      // Si la tarea existe o no
      let tarea = await Tarea.findById( id );

      if(!tarea) {
        throw new Error('Tarea no encontrada');
      }

      // Si la persona que edita es el creador
      if(tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes las credenciales para editar');
      }

      // Eliminar
      await Tarea.findOneAndDelete({_id: id});

      return "Tarea Eliminada";
    }
  }
}

module.exports = resolvers; 
