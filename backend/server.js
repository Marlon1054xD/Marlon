const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(
    path.join(__dirname, "../frontend")
));

const db = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "1234",
    database: "hotel_db"

});

db.connect((err) => {

    if(err){

        console.log(err);

    }else{

        console.log("🔥 MySQL conectado");

    }

});

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );

});

/* =========================
   HABITACIONES
========================= */

app.get("/habitaciones", (req, res) => {

    const sql =
    "SELECT * FROM habitaciones";

    db.query(sql, (err, result) => {

        if(err){

            console.log(err);

            return res.status(500)
            .send("Error");

        }

        res.json(result);

    });

});

/* =========================
   REGISTROS POR HABITACIÓN
========================= */

app.get("/registros/:id", (req, res) => {

    const habitacionId =
    req.params.id;

    const sql = `
    
        SELECT *
        FROM registros
        WHERE habitacion_id = ?
        ORDER BY fecha ASC
    
    `;

    db.query(

        sql,

        [habitacionId],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send("Error");

            }

            res.json(result);

        }

    );

});

/* =========================
   OBTENER 1 REGISTRO
========================= */

app.get("/registro/:id", (req, res) => {

    const sql = `
    
        SELECT *
        FROM registros
        WHERE id = ?
    
    `;

    db.query(

        sql,

        [req.params.id],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send(err);

            }

            res.json(result[0]);

        }

    );

});

/* =========================
   CREAR REGISTRO
========================= */

app.post("/registros", (req, res) => {

    const {

        habitacion_id,
        fecha,
        valor,
        descripcion,
        metodo_pago

    } = req.body;

    const sql = `
    
        INSERT INTO registros
        (
            habitacion_id,
            fecha,
            valor,
            descripcion,
            metodo_pago
        )
        VALUES (?, ?, ?, ?, ?)
    
    `;

    db.query(

        sql,

        [
            habitacion_id,
            fecha,
            valor,
            descripcion,
            metodo_pago
        ],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send("Error");

            }

            res.send("Registro agregado 🔥");

        }

    );

});

/* =========================
   EDITAR REGISTRO
========================= */

app.put("/registros/:id", (req, res) => {

    const {

        fecha,
        valor,
        descripcion,
        metodo_pago

    } = req.body;

    const sql = `
    
        UPDATE registros
        
        SET
        
            fecha = ?,
            valor = ?,
            descripcion = ?,
            metodo_pago = ?
        
        WHERE id = ?
    
    `;

    db.query(

        sql,

        [
            fecha,
            valor,
            descripcion,
            metodo_pago,
            req.params.id
        ],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send(err);

            }

            res.send("Registro actualizado 😎");

        }

    );

});

/* =========================
   ELIMINAR REGISTRO
========================= */

app.delete("/registros/:id", (req, res) => {

    const sql = `
    
        DELETE FROM registros
        WHERE id = ?
    
    `;

    db.query(

        sql,

        [req.params.id],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send("Error");

            }

            res.send("Registro eliminado 🗑️");

        }

    );

});

/* =========================
   LOGIN
========================= */

app.post("/login", (req, res) => {

    const {

        usuario,
        password

    } = req.body;

    const sql = `
    
        SELECT *
        FROM usuarios
        WHERE usuario = ?
        AND password = ?
    
    `;

    db.query(

        sql,

        [usuario, password],

        (err, result) => {

            if(err){

                console.log(err);

                return res.status(500)
                .send("Error");

            }

            if(result.length > 0){

                res.json({
                    success: true
                });

            }else{

                res.json({
                    success: false
                });

            }

        }

    );

});

/* =========================
   DASHBOARD
========================= */

app.get("/dashboard", (req, res) => {

    const sql = `
    
        SELECT
        metodo_pago,
        SUM(valor) as total
        
        FROM registros
        
        GROUP BY metodo_pago
    
    `;

    db.query(sql, (err, result) => {

        if(err){

            console.log(err);

            return res.status(500)
            .send(err);

        }

        let efectivo = 0;
        let transferencia = 0;
        let credito = 0;

        result.forEach(item => {

            if(item.metodo_pago === "Efectivo"){

                efectivo = item.total || 0;

            }

            if(item.metodo_pago === "Transferencia"){

                transferencia = item.total || 0;

            }

            if(item.metodo_pago === "Credito"){

                credito = item.total || 0;

            }

        });

        const sqlHabitaciones = `
        
            SELECT estado
            FROM habitaciones
        
        `;

        db.query(sqlHabitaciones, (err2, habitaciones) => {

            if(err2){

                console.log(err2);

                return res.status(500)
                .send(err2);

            }

            const ocupadas =
            habitaciones.filter(h =>
                h.estado === "Ocupada"
            ).length;

            const libres =
            habitaciones.filter(h =>
                h.estado === "Libre"
            ).length;

            res.json({

                efectivo,
                transferencia,
                credito,
                ocupadas,
                libres,
                totalHabitaciones: habitaciones.length

            });

        });

    });

});

/* =========================
   REPORTE
========================= */

app.get("/reporte", (req, res) => {

    const {

        mes,
        anio,
        quincena

    } = req.query;

    let inicio = 1;
    let fin = 15;

    const ultimoDia =
    new Date(anio, mes, 0).getDate();

    if(quincena == 2){

        inicio = 16;
        fin = ultimoDia;

    }

    const sqlHabitaciones =
    "SELECT * FROM habitaciones";

    const sqlRegistros = `
    
        SELECT
        
            habitaciones.numero,
            registros.valor,
            registros.metodo_pago,
            DAY(registros.fecha) as dia
        
        FROM registros
        
        INNER JOIN habitaciones
        
        ON registros.habitacion_id =
        habitaciones.id
        
        WHERE MONTH(registros.fecha) = ?
        AND YEAR(registros.fecha) = ?
        AND DAY(registros.fecha)
        BETWEEN ? AND ?
    
    `;

    db.query(sqlHabitaciones, (err, habitaciones) => {

        if(err){

            return res.status(500)
            .send(err);

        }

        db.query(

            sqlRegistros,

            [
                mes,
                anio,
                inicio,
                fin
            ],

            (err, registros) => {

                if(err){

                    return res.status(500)
                    .send(err);

                }

                const dias = [];

                for(
                    let i = inicio;
                    i <= fin;
                    i++
                ){

                    dias.push(i);

                }

                const resultado =
                habitaciones.map(habitacion => {

                    const registrosHabitacion = {};

                    registros.forEach(registro => {

                        if(
                            registro.numero ==
                            habitacion.numero
                        ){

                            registrosHabitacion[
                                registro.dia
                            ] = {

                                valor:
                                registro.valor,

                                metodo_pago:
                                registro.metodo_pago

                            };

                        }

                    });

                    return {

                        numero:
                        habitacion.numero,

                        registros:
                        registrosHabitacion

                    };

                });

                res.json({

                    dias,
                    habitaciones: resultado

                });

            }

        );

    });

});

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(3000, () => {

    console.log(
        "🚀 Servidor puerto 3000"
    );

});