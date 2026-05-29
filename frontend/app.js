function formatearDinero(valor){

    return "$" + Number(valor)
    .toLocaleString("es-CO");

}

const contenedor =
document.getElementById("habitaciones");

const dashboard =
document.getElementById("dashboard");

/* DASHBOARD */

fetch("/dashboard")

.then(response => response.json())

.then(data => {

    dashboard.innerHTML = `

        <div class="col-md-3 mb-3">

            <div class="card bg-success text-white p-4 shadow">

                <h4>
                    💵 Efectivo
                </h4>

                <h2>
                    ${formatearDinero(data.efectivo)}
                </h2>

            </div>

        </div>

        <div class="col-md-3 mb-3">

            <div class="card bg-primary text-white p-4 shadow">

                <h4>
                    🏦 Bancos
                </h4>

                <h2>
                    ${formatearDinero(data.transferencia)}
                </h2>

            </div>

        </div>

        <div class="col-md-3 mb-3">

            <div class="card bg-warning text-dark p-4 shadow">

                <h4>
                    📒 Créditos
                </h4>

                <h2>
                    ${formatearDinero(data.credito)}
                </h2>

            </div>

        </div>

        <div class="col-md-3 mb-3">

            <div class="card bg-danger text-white p-4 dashboard-card">

                <h4>
                    🛏️ Habitaciones
                </h4>

                <h2>
                    ${data.totalHabitaciones || 18}
                </h2>

                <small>
                    Control hotelero 😎
                </small>

            </div>

        </div>

    `;

})

.catch(error => {

    console.log(
        "❌ Error dashboard:",
        error
    );

});

/* HABITACIONES */

fetch("/habitaciones")

.then(response => response.json())

.then(data => {

    contenedor.innerHTML = "";

    data.forEach(habitacion => {

        contenedor.innerHTML += `
        
            <div class="col-md-3 mb-4">

                <div 
                    class="card-habitacion"
                    onclick="abrirHabitacion(${habitacion.id}, '${habitacion.numero}')"
                >

                    <h2>
                        🛏️ ${habitacion.numero}
                    </h2>

                    <small>
                        Gestionar registros 💸
                    </small>

                </div>

            </div>
        `;

    });

})

.catch(error => {

    console.log(
        "❌ Error habitaciones:",
        error
    );

});

function abrirHabitacion(id, numero){

    window.location.href =
    `habitacion.html?id=${id}&numero=${numero}`;

}

function logout(){

    localStorage.removeItem("usuario");

    window.location.href =
    "/login.html";

}