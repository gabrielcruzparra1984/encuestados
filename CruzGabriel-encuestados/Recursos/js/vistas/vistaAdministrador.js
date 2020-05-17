/*
 * Vista administrador
 */
var VistaAdministrador = function(modelo, controlador, elementos) {
  this.modelo = modelo;
  this.controlador = controlador;
  this.elementos = elementos;
  var contexto = this;

  // suscripción de observadores
  this.modelo.preguntaAgregada.suscribir(function() {
    contexto.reconstruirLista();
  });

  this.modelo.preguntaEliminada.suscribir(function(){
    contexto.reconstruirLista();
  });

  this.modelo.preguntaEditada.suscribir(function(){
    contexto.reconstruirLista();
    contexto.limpiarEdicion();
  });

  this.modelo.preguntasEliminadas.suscribir(function(){
    contexto.reconstruirLista();
    contexto.limpiarEdicion();
  });
};


VistaAdministrador.prototype = {
  //lista
  inicializar: function() {
    //llamar a los metodos para reconstruir la lista, configurar botones y validar formularios
    this.reconstruirLista();
    this.configuracionDeBotones();
    validacionDeFormulario();
  },

  construirElementoPregunta: function(pregunta){
    var contexto = this;
    var nuevoItem;
    //completar
    //asignar a nuevoitem un elemento li con clase "list-group-item", id "pregunta.id" y texto "pregunta.textoPregunta"
    nuevoItem= $("<li></li>");
    nuevoItem.attr('id', pregunta.id);
    nuevoItem.text(pregunta.textoPregunta);
    nuevoItem.addClass('list-group-item');
    var interiorItem = $('.d-flex');
    var titulo = interiorItem.find('h5');
    titulo.text(pregunta.textoPregunta);
    interiorItem.find('small').text(pregunta.cantidadPorRespuesta.map(function(resp){
      return " " + resp.textoRespuesta;
    }));
    nuevoItem.html($('.d-flex').html());
    return nuevoItem;
  },

  reconstruirLista: function() {
    var lista = this.elementos.lista;
    lista.html('');
    var preguntas = this.modelo.preguntas;
    preguntas.forEach( (preg) => {lista.append(this.construirElementoPregunta(preg));});
  },

  limpiarEdicion : function(){
    this.elementos.respuesta.show();
    this.elementos.botonAgregarPregunta.show();
    this.elementos.pregunta.val('');
    $('#confirmarEdicion').remove();
    $('.form-group.answer[id!="optionTemplate"]').remove();
  },

  configuracionDeBotones: function(){
    var e = this.elementos;
    var contexto = this;

    e.borrarTodo.click(function(){
      contexto.controlador.eliminarPreguntas();
    });

    //asociacion de eventos a boton
    e.botonAgregarPregunta.click(function() {
      var value = e.pregunta.val();
      var respuestas = [];
      var i =0;
      $('[name="option[]"]').each(function() {
        //completar
        if($(this).val()!== null && $(this).val()!== NaN && $(this).val()!== undefined && $(this).val()!==''){
            i++;
            respuestas.push({'id':i, 'textoRespuesta':$(this).val(), 'cantidad':0});
        }
      });
      contexto.limpiarFormulario();
      contexto.controlador.agregarPregunta(value, respuestas);
    });
    //asociar el resto de los botones a eventos
    e.botonBorrarPregunta.click(function(){
      var id = parseInt($('.list-group-item.active').attr('id'));
      if(id){
        contexto.controlador.eliminarPregunta(id);
      } else {
        alert('Debe seleccionar una pregunta parar borrar.');
      }
      
    });

    e.botonEditarPregunta.click(function(){
      var id = parseInt($('.list-group-item.active').attr('id'));
      if(id){
        var pregunta = contexto.controlador.obtenerPregunta(id);
        $('#pregunta').val(pregunta[0].textoPregunta);
        $('#idPregunta').val(pregunta[0].id);
        console.log("Valor edición id: ", $('#idPregunta').val());
        e.respuesta.hide();
        e.botonAgregarPregunta.hide();
        $('.btn.btn-default.botonAgregarRespuesta').remove();
        $('#confirmarEdicion').remove();
        $('.form-group.answer[id!="optionTemplate"]').remove();

        var respuestas = contexto.controlador.obtenerRespuestas(id);
        respuestas.forEach((resp) => {
          var elementoDiv =$('<div></div>');
          elementoDiv.addClass('form-group answer has-feedback');
          elementoDiv.attr('id','p'+pregunta.id+'r'+resp.id);
          elementoDiv.val(resp);
          var elementoInputText = $('<input></input>');
          elementoInputText.attr('type', 'text');
          elementoInputText.attr('name', 'option[]');
          elementoInputText.addClass('form-control');
          elementoInputText.val(resp.textoRespuesta);
          var elementoBotonBorrar = $('<button></button>');
          elementoBotonBorrar.attr('type', 'button');
          elementoBotonBorrar.addClass('btn btn-default botonBorrarRespuesta');
          var elementoIBotonBorrar = $('<i></i>');
          elementoIBotonBorrar.addClass('fa fa-minus');
          elementoBotonBorrar.append(elementoIBotonBorrar);
          elementoDiv.append(elementoInputText);
          elementoDiv.append(elementoBotonBorrar);
          $('.form-box').append(elementoDiv);
        }); 

        var elementoAgregarRespuesta = $('<button></button>');
        elementoAgregarRespuesta.attr('type','button');
        elementoAgregarRespuesta.addClass('btn btn-default botonAgregarRespuesta');
        var elementoIBotonAgregar = $('<i></i>');
        elementoIBotonAgregar.addClass('fa fa-plus');
        elementoAgregarRespuesta.append(elementoIBotonAgregar);
        elementoAgregarRespuesta.append("  Agregar respuesta");
        $('.form-box').append(elementoAgregarRespuesta);

        var elementoEditar  = $('<button></button>');
        elementoEditar.attr('type','reset');
        elementoEditar.addClass('btn btn-default main-button');
        elementoEditar.append("Confirmar edición");
        elementoEditar.attr('id','confirmarEdicion');
        elementoEditar.click(function(){
          contexto.confirmarEdicion();
        });
        $('#localStorageForm').append(elementoEditar);
      } else {
        alert('Debe seleccionar una pregunta para editar.');
      }
    });
  },

  confirmarEdicion : function(){
    var contexto = this;
    if(confirm('Confirma edición de la pregunta '+$('#pregunta').val())){
      var respuestas = [];
      var id =$('#idPregunta').val();
      var textoPregunta = $('#pregunta').val();
      $('[name ="option[]"]').each(function() {
        if($(this).val()!== null && $(this).val()!== NaN && $(this).val()!== undefined && $(this).val()!==''){
            var respuesta = $(this).parent().val();
            if(respuesta){
              respuestas.push({'id':respuesta.id, 'textoRespuesta':$(this).val(), 'cantidad':respuesta.cantidad}); 
            } else{
              respuestas.push({'id': contexto.controlador.obtenerSiguienteIdRespuesta(respuestas), 
              'textoRespuesta':$(this).val(), 'cantidad':0}); 
            }
            
          }
      });
      this.controlador.editarPregunta(id, textoPregunta, respuestas);
    } else {
      alert('Edición cancelada');
      this.limpiarEdicion();
    }  
  },

  limpiarFormulario: function(){
    $('.form-group.answer.has-feedback.has-success').remove();
  },
};
