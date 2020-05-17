/*
 * Modelo
 */
var Modelo = function() {
  this.preguntas = JSON.parse(localStorage.getItem("preguntas")) || [];
  this.ultimoId = 0;

  //inicializacion de eventos
  this.preguntaAgregada = new Evento(this);
  this.preguntaEliminada = new Evento(this);
  this.preguntasEliminadas = new Evento(this);
  this.preguntaEditada = new Evento(this);
  this.votoAgregado = new Evento(this);
};

Modelo.prototype = {
  //se obtiene el id más grande asignado a una pregunta
  obtenerUltimoId: function() {
    var maxId =0;
    if(this.preguntas.length>0){
        this.preguntas.map((preg) => { if(preg.id > maxId) maxId = preg.id});
    } 

    return maxId;
  },

  obtenerSiguienteIdRespuesta: function(respuestas) {
    var maxId =0;
    if(respuestas.length>0){
          respuestas.map((resp) => { if(resp.id > maxId) maxId = resp.id});
    } 
    return maxId+1;
  },

  obtenerPreguntaPorId : function(id){
    return this.preguntas.filter((preg) => preg.id == id);
  },

  //se agrega una pregunta dado un nombre y sus respuestas
  agregarPregunta: function(nombre, respuestas) {
    var id = this.obtenerUltimoId();
    console.log("id obtenido: ", id );
    id++;
    var nuevaPregunta = {'textoPregunta': nombre, 'id': id, 'cantidadPorRespuesta': respuestas};
    this.preguntas.push(nuevaPregunta);
    this.guardar();
    this.preguntaAgregada.notificar();
  },
  //se guardan las preguntas
  guardar: function(){
    localStorage.setItem("preguntas", JSON.stringify(this.preguntas));
  },

  eliminarPregunta: function(id){
    var indice =this.preguntas.map((preg) => {return preg.id}).indexOf(id);
    if(indice !== -1){
      this.preguntas.splice(indice,1);
      this.guardar();
      this.preguntaEliminada.notificar();
    }
  },

  editarPregunta: function(id, textoPregunta, respuestas){
    var preguntasFiltradas = this.obtenerPreguntaPorId(id);
    this.preguntas.forEach((preg)=> { if(preg.id == preguntasFiltradas[0].id ){
        preg.textoPregunta = textoPregunta;
        preg.cantidadPorRespuesta = respuestas;  
    } });
    this.guardar();
    this.preguntaEditada.notificar();
  },

  agregarRespuesta: function(id, respuesta){
    var preguntas = this.obtenerPreguntaPorId(id);
    preguntas.forEach((preg) => {preg.cantidadPorRespuesta.push(respuesta)});
    this.respuestaAgregada.notificar();
  },

  eliminarPreguntas: function(){
    this.preguntas = [];
    this.guardar();
    this.preguntasEliminadas.notificar();
  },

  obtenerRespuestas : function(id){
    var preguntas = this.obtenerPreguntaPorId(id);
    return preguntas[0].cantidadPorRespuesta; 
  },

  agregarVoto: function(idPregunta, idRespuesta){
      this.preguntas
      .filter((preg) => {return preg.id == idPregunta})
      .forEach((preg)=> { 
        preg.cantidadPorRespuesta
          .filter((resp)=> { return resp.id == idRespuesta} )
          .forEach((resp) => { resp.cantidad = resp.cantidad+1})});
          this.guardar();
          this.votoAgregado.notificar();
    },

};
