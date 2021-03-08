const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
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
   
  },
  Mutation: {
    crearUsuario: async (_, {input}) => {
      const { email , password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      if (existeUsuario) {
        throw Error('El usuario ya existe')
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
        throw Error('El usuario no existe')
      }

      // El password es correcto
      const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password)

      if (!passwordCorrecto) {
        throw Error('Password incorrecto');
      }

      // dar acceso a la app
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
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
        throw new Error('NO tienes las credenciales para editar');
      }

      // guardar el proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, { new: true });
      return proyecto;
    }
  }
}

module.exports = resolvers; 
