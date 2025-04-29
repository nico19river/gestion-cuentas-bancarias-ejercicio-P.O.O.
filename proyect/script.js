class CuentaBancaria {
  constructor(numeroCuenta, titular, saldo) {
    this.numeroCuenta = numeroCuenta;
    this.titular = titular;
    this.saldo = parseFloat(saldo);
  }

  depositar(monto) {
    this.saldo += parseFloat(monto);
  }

  retirar(monto) {
    if (this.saldo >= monto) {
      this.saldo -= parseFloat(monto);
      return true;
    }
    return false;
  }

  transferir(destino, monto) {
    if (this.retirar(monto)) {
      destino.depositar(monto);
      return true;
    }
    return false;
  }
}

class Banco {
  constructor() {
    const cuentasGuardadas = JSON.parse(localStorage.getItem("listaCuentas")) || [];
    this.cuentas = cuentasGuardadas.map(c => new CuentaBancaria(c.numeroCuenta, c.titular, c.saldo));
    this.historial = JSON.parse(localStorage.getItem("historialOperaciones")) || [];
  }

  guardar() {
    localStorage.setItem("listaCuentas", JSON.stringify(this.cuentas));
    localStorage.setItem("historialOperaciones", JSON.stringify(this.historial));
  }

  crearCuenta(numero, titular, saldo) {
    if (this.buscarCuenta(numero)) {
      alert("Ya existe una cuenta con ese número.");
      return;
    }
    const nueva = new CuentaBancaria(numero, titular, saldo);
    this.cuentas.push(nueva);
    this.registrarOperacion(`🟢 Se creó la cuenta ${numero} a nombre de ${titular} con $${saldo}`);
    this.guardar();
    this.listarCuentas();
    this.mostrarHistorial();
  }

  eliminarCuenta(numero) {
    const index = this.cuentas.findIndex(c => c.numeroCuenta === numero);
    if (index !== -1) {
      this.cuentas.splice(index, 1);
      this.registrarOperacion(`❌ Se eliminó la cuenta ${numero}`);
      this.guardar();
      this.listarCuentas();
      this.mostrarHistorial();
    }
  }

  buscarCuenta(numero) {
    return this.cuentas.find(c => c.numeroCuenta === numero);
  }

  listarCuentas() {
    const contenedor = document.getElementById("listaCuentas");
    contenedor.innerHTML = "";
  
    this.cuentas.forEach(cuenta => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
  
      col.innerHTML = `
        <div class="card card-cuenta shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${cuenta.titular}</h5>
            <p class="card-text">
              <strong>N°:</strong> ${cuenta.numeroCuenta}<br>
              <strong>Saldo:</strong> $${cuenta.saldo.toFixed(2)}
            </p>
            <input type="number" class="form-control mb-2" placeholder="Monto" id="monto-${cuenta.numeroCuenta}" />
            <div class="d-grid gap-1">
              <button class="btn btn-success btn-sm" onclick="depositar('${cuenta.numeroCuenta}')">Depositar</button>
              <button class="btn btn-warning btn-sm" onclick="retirar('${cuenta.numeroCuenta}')">Retirar</button>
              <button class="btn btn-info btn-sm" onclick="transferir('${cuenta.numeroCuenta}')">Transferir</button>
              <button class="btn btn-danger btn-sm" onclick="banco.eliminarCuenta('${cuenta.numeroCuenta}')">Eliminar</button>
            </div>
          </div>
        </div>
      `;
      contenedor.appendChild(col);
    });
  }
  

  registrarOperacion(mensaje) {
    const fecha = new Date().toLocaleString();
    const entrada = `[${fecha}] ${mensaje}`;
    this.historial.push(entrada);
    this.guardar();
  }

  mostrarHistorial() {
    const ul = document.getElementById("historial");
    ul.innerHTML = "";
    this.historial.slice().reverse().forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      ul.appendChild(li);
    });
  }
}

const banco = new Banco();
banco.listarCuentas();
banco.mostrarHistorial();

document.getElementById("formCuenta").addEventListener("submit", e => {
  e.preventDefault();
  const titular = document.getElementById("titular").value;
  const numero = document.getElementById("numero").value;
  const saldo = document.getElementById("saldo").value;

  if (titular && numero && saldo) {
    banco.crearCuenta(numero, titular, saldo);
    e.target.reset();
  } else {
    alert("Completa todos los campos.");
  }
});

function depositar(numero) {
  const cuenta = banco.buscarCuenta(numero);
  const monto = document.getElementById(`monto-${numero}`).value;
  if (cuenta && monto > 0) {
    cuenta.depositar(parseFloat(monto));
    banco.registrarOperacion(`💰 Se depositaron $${monto} en la cuenta ${numero}`);
    banco.guardar();
    banco.listarCuentas();
    banco.mostrarHistorial();
  }
}

function retirar(numero) {
  const cuenta = banco.buscarCuenta(numero);
  const monto = document.getElementById(`monto-${numero}`).value;
  if (cuenta && monto > 0) {
    if (cuenta.retirar(parseFloat(monto))) {
      banco.registrarOperacion(`💸 Se retiraron $${monto} de la cuenta ${numero}`);
      banco.guardar();
      banco.listarCuentas();
      banco.mostrarHistorial();
    } else {
      alert("Saldo insuficiente.");
    }
  }
}

function transferir(origenNumero) {
  const origen = banco.buscarCuenta(origenNumero);
  const monto = prompt("Monto a transferir:");
  const destinoNumero = prompt("Número de cuenta destino:");
  const destino = banco.buscarCuenta(destinoNumero);

  if (!origen || !destino) return alert("Cuenta no encontrada.");
  if (origenNumero === destinoNumero) return alert("No podés transferir a la misma cuenta.");
  if (isNaN(monto) || monto <= 0) return alert("Monto inválido.");

  if (origen.transferir(destino, parseFloat(monto))) {
    banco.registrarOperacion(`🔁 Se transfirieron $${monto} de ${origenNumero} a ${destinoNumero}`);
    banco.guardar();
    banco.listarCuentas();
    banco.mostrarHistorial();
  } else {
    alert("Saldo insuficiente.");
  }
}
