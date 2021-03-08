const mongoose = require('mongoose');

const PoryectoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  creador: {
    type: mongoose.Schema.Types.ObjectId, //toma valores del _id: Objectid creado por mongo
    ref: 'Usuario'

  },
  creado: {
    type: Date,
    default: Date.now()
  }
})

module.exports = mongoose.model('Proyecto', PoryectoSchema);