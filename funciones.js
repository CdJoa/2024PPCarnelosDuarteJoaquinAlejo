class Vehiculo {
    constructor(id, modelo, anoFab, velMax) {
        if (id <= 0) {
            throw new Error("ID debe ser mayor a 0");
        }
        this.id = id; 
        this.modelo = modelo;
        if (typeof modelo !== 'string' || modelo.trim() === '') {
            throw new Error("Modelo debe ser un string no vacío");
        }
        this.anoFab = anoFab;
        if (typeof anoFab !== 'number' || anoFab <= 1985) {
            throw new Error("Año de fabricación debe ser un número mayor a 1985");
        }
        this.velMax = velMax;
        if (typeof velMax !== 'number' || velMax <= 0) {
            throw new Error("Velocidad máxima debe ser un número mayor a 0");
        }
    }
    toString() {
        return `Vehiculo [ID: ${this.id}, Modelo: ${this.modelo}, Año de Fabricación: ${this.anoFab}, Velocidad Máxima: ${this.velMax} km/h]`;
    }
}

class Aereo extends Vehiculo {
    constructor(id, modelo, anoFab, velMax, alturaMax, autonomia) {
        super(id, modelo, anoFab, velMax);
        if (typeof alturaMax !== 'number' || alturaMax <= 0) {
            throw new Error("Altura máxima debe ser un número mayor a 0");
        }
        this.alturaMax = alturaMax;
        if (typeof autonomia !== 'number' || autonomia <= 0) {
            throw new Error("Autonomía debe ser un número mayor a 0");
        }
        this.autonomia = autonomia;
    }

    toString() {
        return `Aereo [ID: ${this.id}, Modelo: ${this.modelo}, Año de Fabricación: ${this.anoFab}, Velocidad Máxima: ${this.velMax} km/h, Altura Máxima: ${this.alturaMax} m, Autonomía: ${this.autonomia} km]`;
    }
}
class Terrestre extends Vehiculo {
    constructor(id, modelo, anoFab, velMax, cantPue, cantRue) {
        super(id, modelo, anoFab, velMax);
        if (typeof cantPue !== 'number' || cantPue < 0) {
            throw new Error("Cantidad de puertas debe ser positivo");
        }
        this.cantPue = cantPue;
        if (typeof cantRue !== 'number' || cantRue <= 0) {
            throw new Error("Cantidad de ruedas debe ser  mayor a 0");
        }
        this.cantRue = cantRue;
    }

    toString() {
        return `Terrestre [ID: ${this.id}, Modelo: ${this.modelo}, Año de Fabricación: ${this.anoFab}, Velocidad Máxima: ${this.velMax} km/h, Cantidad de Puertas: ${this.cantPue}, Cantidad de Ruedas: ${this.cantRue}]`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    inicializarEventListeners();
    document.getElementById('filtro').dispatchEvent(new Event('change'));
});

function inicializarEventListeners() {
    let elementoFiltro = document.getElementById('filtro');
    let elementoFiltroAbm = document.getElementById('filtroAbm');
    let botonCalcularPromedio = document.getElementById('calcularPromedio');

    elementoFiltro.addEventListener('change', manejarCambioFiltro);
    elementoFiltroAbm.addEventListener('change', manejarCambioFiltroAbm);

    if (botonCalcularPromedio) {
        botonCalcularPromedio.addEventListener('click', calcularPromedio);
    }
}

function manejarCambioFiltro() {
    const filtro = this.value;
    console.log('Filtro seleccionado:', filtro);
    const contenedorChecklist = document.getElementById('checklist-container');
    const contenedorTabla = document.getElementById('tabla-container');
    const parametrosJson = {
        "0": ['id', 'modelo', 'anoFab', 'velMax'],
        "1": ['id', 'modelo', 'anoFab', 'velMax', 'alturaMax', 'autonomia'],
        "2": ['id', 'modelo', 'anoFab', 'velMax', 'cantPue', 'cantRue']
    };

    while (contenedorChecklist.firstChild) {
        contenedorChecklist.removeChild(contenedorChecklist.firstChild);
    }
    while (contenedorTabla.firstChild) {
        contenedorTabla.removeChild(contenedorTabla.firstChild);
    }

    crearChecklist(parametrosJson[filtro]);
    crearTabla(filtro, parametrosJson[filtro]);
}
function crearChecklist(parametros) {
    const contenedorChecklist = document.getElementById('checklist-container');
    const divRow = document.createElement('div');
    divRow.className = 'checklist-row';
    parametros.forEach(param => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.innerHTML = `
            <input type="checkbox" id="${param}" name="${param}" checked>
            <label for="${param}">${param.charAt(0).toUpperCase() + param.slice(1)}</label>
        `;
        divRow.appendChild(div);

        div.querySelector('input').addEventListener('change', function () {
            const columnas = document.querySelectorAll(`[data-param="${param}"]`);
            columnas.forEach(celda => {
                celda.style.display = this.checked ? '' : 'none';

                const indiceColumna = Array.from(celda.parentNode.children).indexOf(celda);
                const encabezado = document.querySelector(`th:nth-child(${indiceColumna + 1})`);
                encabezado.style.display = this.checked ? '' : 'none';
            });
        });
    });
    contenedorChecklist.appendChild(divRow);
}


function crearTabla(filtro, headers) {
    fetch('./vehiculos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            let vehiculos;
            if (filtro === "1") {
                vehiculos = data.filter(vehiculo => vehiculo.altMax !== undefined && vehiculo.autonomia !== undefined);
            } else if (filtro === "2") {
                vehiculos = data.filter(vehiculo => vehiculo.cantPue !== undefined && vehiculo.cantRue !== undefined);
            } else {
                vehiculos = data;
            }

            const contenedorTabla = document.getElementById('tabla-container');
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const tr = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header.charAt(0).toUpperCase() + header.slice(1);
                th.addEventListener('dblclick', () => ordenarTablaPorColumna(table, header)); 
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            table.appendChild(thead);

            vehiculos.forEach(vehiculo => {
                const tr = document.createElement('tr');
                headers.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = vehiculo[header] !== undefined ? vehiculo[header] : '';
                    td.setAttribute('data-param', header);
                    tr.appendChild(td);
                });
                tr.addEventListener('dblclick', () => llenarFormularioAbm(vehiculo)); 
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            contenedorTabla.appendChild(table);

        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}


function calcularPromedio() {
    const filas = document.querySelectorAll('#tabla-container table tbody tr');
    let totalVelocidad = 0;
    let contador = 0;

    filas.forEach(fila => {
        const celdaVelocidad = fila.querySelector('td[data-param="velMax"]');
        if (celdaVelocidad) {
            const velocidad = parseFloat(celdaVelocidad.textContent);
            if (!isNaN(velocidad)) {
                totalVelocidad += velocidad;
                contador++;
            }
        }
    });

    const promedioVelocidad = totalVelocidad / contador;
    document.getElementById('velocidad-maxima').value = promedioVelocidad.toFixed(2);
    console.log(`Promedio de Velocidad actual: ${promedioVelocidad.toFixed(2)} km/h`);
}
function manejarCambioFiltroAbm() {
    const filtro = this.value;
    const contenedorCamposExtraAbm = document.getElementById('extra-fields-abm');
    contenedorCamposExtraAbm.innerHTML = ''; 

    if (filtro == "1") {
        contenedorCamposExtraAbm.innerHTML = `
            <div>
                <label for="altMax">Altura:</label>
                <input type="number" id="altMax" name="altMax">
            </div>
            <div>
                <label for="autonomia">Autonomía:</label>
                <input type="number" id="autonomia" name="autonomia">
            </div>
        `;
    } else if (filtro == "2") {
        contenedorCamposExtraAbm.innerHTML = `
            <div>
                <label for="cantPue">Cantidad de Puertas:</label>
                <input type="number" id="cantPue" name="cantPue">
            </div>
            <div>
                <label for="cantRue">Cantidad de Ruedas:</label>
                <input type="number" id="cantRue" name="cantRue">
            </div>
        `;
    } else {
        contenedorCamposExtraAbm.innerHTML = ''; 
    }
    }


function agregarElemento() {
    const formDatos = document.getElementById('form-datos');
    const formAbm = document.getElementById('form-abm');

    if (formDatos && formAbm) {
        formDatos.style.display = 'none';
        formAbm.style.display = 'block';
    }
}
function cancelar() {
    const formDatos = document.getElementById('form-datos');
    const formAbm = document.getElementById('form-abm');

    if (formDatos && formAbm) {
        formDatos.style.display = 'block';
        formAbm.style.display = 'none';
    }
}
function ordenarTablaPorColumna(table, columna) {
    const tbody = table.querySelector('tbody');
    const filas = Array.from(tbody.querySelectorAll('tr'));
    const indiceColumna = Array.from(table.querySelectorAll('th')).findIndex(th => th.textContent.toLowerCase() === columna.toLowerCase());

    filas.sort((a, b) => {
        const aTexto = a.children[indiceColumna].textContent;
        const bTexto = b.children[indiceColumna].textContent;

        if (!isNaN(aTexto) && !isNaN(bTexto)) {
            return parseFloat(aTexto) - parseFloat(bTexto);
        }

        return aTexto.localeCompare(bTexto);
    });

    filas.forEach(fila => tbody.appendChild(fila));
}

function alternarFormulario(formId) {
    const formDatos = document.getElementById('form-datos');
    const formAbm = document.getElementById(formId);

    if (formDatos && formAbm) {
        formDatos.style.display = 'none';
        formAbm.style.display = 'block';
    }
}
llenarFormularioAbm = function(item) {
    const elementoFiltroAbm = document.getElementById('filtroAbm');
    document.getElementById('id1').value = item.id;
    document.getElementById('ModeloDistinto').value = item.modelo; 
    document.getElementById('anoFabrica').value = item.anoFab; 
    document.getElementById('velocidadMaxima').value = item.velMax; 


    const idValue = item.id;
    if (isNaN(idValue) || idValue <= 0) {
        console.error("ID no válido:", idValue);
        return;
    }

    if (item.hasOwnProperty('alturaMax') && item.hasOwnProperty('autonomia')) {
        elementoFiltroAbm.value = "1";
    } else if (item.hasOwnProperty('cantPue') && item.hasOwnProperty('cantRue')) {
        elementoFiltroAbm.value = "2";
    } else {
        elementoFiltroAbm.value = "0";
    }
    elementoFiltroAbm.dispatchEvent(new Event('change'));

    if (item.hasOwnProperty('alturaMax')) {
        document.getElementById('altMax').value = item.alturaMax;
    }
    if (item.hasOwnProperty('autonomia')) {
        document.getElementById('autonomia').value = item.autonomia;
    }
    if (item.hasOwnProperty('cantPue')) {
        document.getElementById('cantPue').value = item.cantPue;
    }
    if (item.hasOwnProperty('cantRue')) {
        document.getElementById('cantRue').value = item.cantRue;
    }

    alternarFormulario('form-abm');
}
