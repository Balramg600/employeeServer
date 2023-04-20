let express=require('express');
let app=express();
app.use(express.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// let mysql=require("mysql");
// let connData={
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:'textDB',
// };

const {Pool}=require("pg");
const client=new Pool({
    user:"postgres",
    password:"jU9b0FzDHK9A51P3",
    database:"postgres",
    port:5432,
    host:"db.cfdhexebrdpjmzmfwdcg.supabase.co",
    ssl:{rejectUnauthorized:false},
});
client.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });
// client.connect((res, err)=>{
//     console.log('Connected!!!');
// });sudo service postgresql restart

const port= process.env.PORT || 2411;
app.listen(port, ()=>console.log(`Node app listening on port ${port}!`));

let {empsData}=require('./empsData.js');
let fs=require('fs');
const { json } = require('express');
const cli = require('nodemon/lib/cli/index.js');


app.get('/svr/employees', (req, res)=>{
    let{department, designation, gender}=req.query;
    let sql="SELECT * FROM employees";
    client.query(sql, function(err, result){
        if(err) {
            res.status(404).send(err);
            console.log(err,'hii1')
        }
        else{
            let arr=result.rows;
            if(department) arr=arr.filter(n=>n.department===department)
            if(designation) arr=arr.filter(n=>n.designation===designation);
            if(gender)arr=arr.filter(n=>n.gender==gender);
            res.send(arr);
            console.log('correct')
        }
    });
})

app.get('/svr/employees/:empCode', (req, res)=>{
    let empCode=+req.params.empCode;
    let sql="SELECT * FROM employees";
    client.query(sql, function(err, result){
        if(err) res.status(404).send(err);
        else{
            let emp=result.rows.find(n=>n.empcode==empCode);
            // console.log(emp, empCode)
            res.send(emp);
        }
    });
});


app.post('/svr/employees', (req, res)=>{
    let body=req.body;
    let params=[body.empcode, body.name, body.department, body.designation, body.salary, body.gender];
    // let connection=mysql.createConnection(connData);
    let sql="Insert into employees (empCode, name, department, designation, salary, gender) values ($1, $2, $3, $4, $5, $6)";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from employees";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows);
            })
        } 
    });
})

app.put('/svr/employees/:empcode', (req, res)=>{
    let body=req.body;
    let empcode=+req.params.empcode;
    let params=[body.name, body.department, body.designation, body.salary, body.gender, body.empcode];
    // let connection=mysql.createConnection(connData);
    let sql="UPDATE employees SET name=$1, department=$2, designation=$3, salary=$4, gender=$5 WHERE empCode=$6";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            // console.log(body);
            let sql2="Select * from employees";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows.find(n=>n.empcode==empcode));
            })
        } 
    });
})

app.delete('/svr/employees/:empcode', (req, res)=>{
    let empcode=+req.params.empcode;
    // let connection=mysql.createConnection(connData);
    let sql="DELETE FROM employees WHERE empCode =$1";
    client.query(sql, [empcode], (err, result)=>{
        console.log(result)
        if(err) res.status(404).send(err);
        else res.send("done");
    })
})

// app.get('/svr/resetData', (req, res)=>{
//     let connection=mysql.createConnection(connData);
//     let sql1="Delete from employees";
//     connection.query(sql1,(err, result)=>{
//         if(err) res.status(404).send(err)
//         else {
//             let {empsData} =require('./empsData.js');
//             let arr1=empsData.map(p=>[p.empCode, p.name, p.department, p.designation, p.salary, p.gender]);
//             let sql2="Insert into employees (empCode, name, department, designation, salary, gender) values ?";
//             connection.query(sql2, [arr1], function(err, result){
//                 if(err) res.status(404).send(err);
//                 else res.send(result);
//             });
//         }
//     });
// })
// app.get('/svr/resetData', (req, res, next)=>{
//     // let connection=client.createConnection(client);
//     // client.connect((res,error)=>console.log("Connected!!"));empCode, name, department, designation, salary, gender
//     let sql1="Delete from employees";
//     client.query(sql1,(err, result)=>{
//         if(err) res.status(404).send(err)
//         else {
//             let {empsData} =require('./empsData.js');
//             let arr1=empsData.map(p=>[p.empCode, p.name, p.department, p.designation, p.salary, p.gender]);
//             let sql2="Insert into employees (arr1) values ($1) ";
//             client.query(sql2, [arr1], function(err, result){
//                 if(err) res.status(404).send(err);
//                 else res.send(result);
//             });
//         }
//         client.end();psql -h db.cfdhexebrdpjmzmfwdcg.supabase.co -d postgres -U postgres
//     });
// })

// app.get('/svr/resetData', (req, res)=>{
//     let sql1 = "DELETE FROM employees";
//     client.query(sql1, (err, result)=>{
//         if(err) {
//             res.status(404).send(err);
//             console.log(err, "hii1");
//         }
//         else {
//             let {empsData} = require('./empsData.js');
//             let arr1 = empsData.map(p => [p.empCode, p.name, p.department, p.designation, p.salary, p.gender]);
//             let sql2 = `INSERT INTO employees (empCode, name, department, designation, salary, gender) VALUES ($1)`;
//             client.query(sql2,arr1, (err, result) => {
//                 if(err) {
//                     res.status(404).send(err);
//                     console.log(err, "hii")
//                 }
//                 else res.send(result.rows);
//             });
//         }
//         client.end()
//     });
// });

app.get('/svr/resetData', (req, res)=>{
    let sql1 = "DELETE FROM employees";
    client.query(sql1,  (err, result)=>{
        if(err) {
            res.status(404).send(err);
            console.log(err, "hii1");
        }
        else {
            let {empsData} = require('./empsData.js');
            let arr1 = empsData.map(p => [p.empCode, p.name, p.department, p.designation, p.salary, p.gender]);
            // console.log(arr1);
            for(row of arr1){
                // console.log(row)
                let sql=`INSERT INTO employees (empCode, name, department, designation, salary, gender) VALUES ($1, $2, $3, $4, $5, $6)`;

                client.query(sql,row, (err, result)=>{
                    if(err){
                        res.status(404).send(err);
                    }
                    else{
                        // res.json({
                        //     data:result.rows
                        // })
                        console.log("done")
                    }
                })
            }
            // let sql2 = `INSERT INTO employees (empCode, name, department, designation, salary, gender) VALUES ($1)`;
            // client.query(sql2, (err, result) => {
            //     if(err) {
            //         res.status(404).send(err);
            //         console.log(err, "hii");
            //     }
            //     else res.send(result.rows);
            // });
        }
        // client.end()
        //INSERT INTO employees (empCode, name, department, designation, salary, gender) VALUES ($1)
    });
});
