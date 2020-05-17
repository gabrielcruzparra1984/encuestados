/*
 * Vista usuario
 */
var VistaUsuario = function(modelo, controlador, elementos) {
  this.modelo = modelo;
  this.controlador = controlador;
  this.elementos = elementos;
  var contexto = this;

  //suscripcion a eventos del modelo
  this.modelo.preguntaAgregada.suscribir(function() {
    contexto.reconstruirLista();
    contexto.reconstruirGrafico();
  });

  this.modelo.preguntaEliminada.suscribir(function(){
    contexto.reconstruirLista();
    contexto.reconstruirGrafico();
  });

  this.modelo.preguntaEditada.suscribir(function(){
    contexto.reconstruirLista();
    contexto.reconstruirGrafico();
  });

  this.modelo.preguntasEliminadas.suscribir(function(){
    contexto.reconstruirLista();
    contexto.reconstruirGrafico();
  });

  this.modelo.votoAgregado.suscribir(function() {
    contexto.reconstruirGrafico();
  });
};

VistaUsuario.prototype = {
  //muestra la lista por pantalla y agrega el manejo del boton agregar
  inicializar: function() {
    this.reconstruirLista();
    var elementos = this.elementos;
    var contexto = this;
    
    elementos.botonAgregar.click(function() {
      contexto.agregarVotos(); 
    });
      
    this.reconstruirGrafico();
  },

  //reconstruccion de los graficos de torta
  reconstruirGrafico: function(){
    var contexto = this;
    //obtiene las preguntas del local storage
    var preguntas = this.modelo.preguntas;
    preguntas.forEach(function(clave){
      var listaParaGrafico = [[clave.textoPregunta, 'Cantidad']];
      var respuestas = clave.cantidadPorRespuesta;
      respuestas.forEach (function(elemento) {
        listaParaGrafico.push([elemento.textoRespuesta,elemento.cantidad]);
      });
      contexto.dibujarGrafico(clave.textoPregunta, listaParaGrafico);
    })
  },


  reconstruirLista: function() {
    var listaPreguntas = this.elementos.listaPreguntas;
    listaPreguntas.html('');
    var contexto = this;
    var preguntas = this.modelo.preguntas;
    preguntas.forEach(function(clave){
      //completar
      //agregar a listaPreguntas un elemento div con valor "clave.textoPregunta", texto "clave.textoPregunta", id "clave.id"
      var divPregunta = $('<div></div>');
      divPregunta.val(clave.textoPregunta);
      divPregunta.text(clave.textoPregunta);
      divPregunta.attr('id',clave.id);
      listaPreguntas.append(divPregunta);
      var respuestas = clave.cantidadPorRespuesta;
      contexto.mostrarRespuestas(listaPreguntas,respuestas, clave);
    })
  },

  //muestra respuestas
  mostrarRespuestas:function(listaPreguntas,respuestas, clave){
    respuestas.forEach (function(elemento) {
      listaPreguntas.append($('<input>', {
        type: 'radio',
        value:elemento.id,
        name: clave.id,
        
      }));
      listaPreguntas.append($("<label>", {
        for: elemento.textoRespuesta,
        text: elemento.textoRespuesta
      }));
    });
  },

  agregarVotos: function(){
    var contexto = this;
    if (contexto.validarNombreEncuestado($('#nombreUsuario').val())){
      if(contexto.validarChequeoPreguntas){
        $('#preguntas').find('div').each(function(){
          var nombrePregunta = $(this).attr('value');
          var id = $(this).attr('id');
          var resp = $('input[name=' + id + ']:checked');
          var  idRespuesta = resp.val();
          $('input[name=' + id + ']').prop('checked',false);
          contexto.controlador.agregarVoto(id,idRespuesta);
        }); 
      } else {
        alert('Debe seleccionar una opción para cada pregunta.');
      }
      
    } else {
      alert('La persona con nombre: '+$('#nombreUsuario').val()+' ya envió sus respuestas o el nombre es vacío!...');
    }
    
  },

  validarChequeoPreguntas: function(){
    
    $('#preguntas').find('div').each(function(){
      var id = $(this).attr('id');
      var resp = $('input[name=' + id + ']:checked');
      if(!resp){
        return false;
      }
    });

    return true;
  },

  validarNombreEncuestado : function(nombre){
    if(nombre !== null && nombre !== NaN && nombre !== undefined && nombre !== ''){
      var encuestados = JSON.parse(localStorage.getItem("encuestados")) || [];
      if(encuestados.filter((person) => {return person.toLowerCase() == nombre.toLowerCase()}).length>0){
        return false;
      }
      encuestados.push(nombre.toLowerCase());
      localStorage.setItem("encuestados", JSON.stringify(encuestados));
      return true; 
    } else {
      return false;
    }
  },

  dibujarGrafico: function(nombre, respuestas){
    var seVotoAlgunaVez = false;
    for(var i=1;i<respuestas.length;++i){
      if(respuestas[i][1]>0){
        seVotoAlgunaVez = true;
      }
    }
    var contexto = this;
    google.charts.load("current", {packages:["corechart"]});
    google.charts.setOnLoadCallback(drawChart);
    function drawChart() {
      var data = google.visualization.arrayToDataTable(respuestas);

      var options = {
        title: nombre,
        is3D: true,
      };
      var ubicacionGraficos = contexto.elementos.graficosDeTorta;
      var id = (nombre.replace(/\W/g, '')).split(' ').join('')+'_grafico';
      if($('#'+id).length){$('#'+id).remove()}
      var div = document.createElement('div');
      ubicacionGraficos.append(div);
      div.id = id;
      div.style.width = '400';
      div.style.height = '300px';
      var chart = new google.visualization.PieChart(div);
      if(seVotoAlgunaVez){
        chart.draw(data, options);
      }
    }
  },
};
