const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');

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
    }
  }
}

module.exports = resolvers; 
