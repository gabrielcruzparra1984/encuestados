/*
 * Controlador
 */
var Controlador = function(modelo) {
  this.modelo = modelo;
};

Controlador.prototype = {
  agregarPregunta: function(pregunta, respuestas) {
      this.modelo.agregarPregunta(pregunta, respuestas);
  },
  eliminarPregunta: function(id){
    this.modelo.eliminarPregunta(id);
  },

  editarPregunta: function(id, textoPregunta, respuestas){
    this.modelo.editarPregunta(id, textoPregunta, respuestas);
  },

  agregarRespuesta: function(id, respuesta){
    this.modelo.agregarRespuesta(id, respuesta);
  },

  obtenerRespuestas : function(id){
    return this.modelo.obtenerRespuestas(id);
  },

  obtenerPregunta : function(id){
    return this.modelo.obtenerPreguntaPorId(id);
  },

  eliminarPreguntas: function(){
    this.modelo.eliminarPreguntas();
  },

  agregarVoto : function(idPregunta, idRespuesta){
    this.modelo.agregarVoto(idPregunta, idRespuesta);
  },

  obtenerSiguienteIdRespuesta: function(respuestas){
    return this.modelo.obtenerSiguienteIdRespuesta(respuestas);
  }

};
