
const cursos = [
  {
    titulo: 'JavaScript moderno guia definitiva construye 10 proyectos',
    tecnologia: 'Javascript ES6',
  },
  {
    titulo: 'React - La guiía complet: hooks Context redux MERN +15 APPs',
    tecnologia: 'React',
  },
  {
    titulo: 'Node.js - Bootcamp desarrollo web inc. MVC y REST APIs',
    tecnologia: 'Node.js',
  },
  {
    titulo: 'ReactJS Avanzado - Fullstack React GraphQL y APollo',
    tecnologia: 'React',
  }
];


const resolvers = {
  Query: {
    obtenerCursos: () => cursos,

    obtenerTecnologia: () => cursos
  }
}

module.exports = resolvers; 
