import{f as u,c as h,u as b,d as f}from"./clientes.api-BqcUBKOG.js";import{t as y}from"./tokenStorage-BJFfxEW5.js";class r{constructor({id:e=null,numeroCliente:i,nombre:n,apellido:a,telefono:s,domicilio:d,numeroDomicilio:c,email:m}){this.id=e,this.numeroCliente=i.trim(),this.nombre=n.trim(),this.apellido=a.trim(),this.telefono=s.trim(),this.domicilio=d.trim(),this.numeroDomicilio=c,this.email=m.trim()}}function o(t){return new r({id:t.id,numeroCliente:t.numero_cliente,nombre:t.nombre,apellido:t.apellido,telefono:t.telefono,domicilio:t.domicilio,numeroDomicilio:t.numero_domicilio,email:t.email})}function l(t){return{numero_cliente:t.numeroCliente,nombre:t.nombre,apellido:t.apellido,telefono:t.telefono,domicilio:t.domicilio,numero_domicilio:Number(t.numeroDomicilio),email:t.email}}async function E(t){return(await u(t)).map(o)}async function C(t,e){const i=l(t),n=await h(i,e);return o(n)}async function p(t,e){const i=l(t),n=await b(t.id,i,e);return o(n)}async function w(t,e){return f(t,e)}class v{constructor({view:e,tokenProvider:i}){this.view=e,this.tokenProvider=i,this.clientes=[],this.clienteEditando=null}async init(){this.bindEvents(),await this.cargarClientes()}bindEvents(){this.view.onSubmit(e=>this.handleGuardar(e)),this.view.onEdit(e=>this.handleEditar(e)),this.view.onDelete(e=>this.handleEliminar(e))}async cargarClientes(){try{const e=this.tokenProvider.getToken();this.clientes=await E(e),this.view.render(this.clientes)}catch(e){this.view.renderError(e.message)}}async handleGuardar(e){try{const i=this.tokenProvider.getToken(),n=new r({...e,id:this.clienteEditando?.id??null});this.clienteEditando?(await p(n,i),this.clienteEditando=null):await C(n,i),await this.cargarClientes(),this.view.resetForm()}catch(i){this.view.renderError(i.message)}}handleEditar(e){const i=this.clientes.find(n=>n.id===e);i&&(this.clienteEditando=i,this.view.fillForm(i))}async handleEliminar(e){if(confirm("¿Eliminar cliente?"))try{const n=this.tokenProvider.getToken();await w(e,n),await this.cargarClientes()}catch(n){this.view.renderError(n.message)}}}class g{constructor(e){this.tableBody=document.querySelector(e)}onEdit(e){this._onEdit=e}onDelete(e){this._onDelete=e}render(e){if(this.tableBody.innerHTML="",!e||!e.length){this.tableBody.innerHTML=`
        <tr>
          <td colspan="100%">No hay registros</td>
        </tr>
      `;return}e.forEach(i=>{const n=document.createElement("tr");n.innerHTML=`
        ${this.buildRowCells(i)}
        <td>
          <button type="button" class="btn-edit">✏️</button>
          <button type="button" class="btn-delete">🗑️</button>
        </td>
      `,n.querySelector(".btn-edit").onclick=()=>{this._onEdit?.(i.id)},n.querySelector(".btn-delete").onclick=()=>{this._onDelete?.(i.id)},this.tableBody.appendChild(n)})}buildRowCells(){throw new Error("Debes implementar buildRowCells en la clase hija")}showError(e){console.error(e),this.tableBody&&(this.tableBody.innerHTML=`
      <tr>
        <td colspan="100%" style="color:red">
          ${e}
        </td>
      </tr>
    `)}}class B extends g{constructor({tableSelector:e,formSelector:i}){super(e),this.form=document.querySelector(i),this.form&&(this.btnSubmit=this.form.querySelector("[type='submit']"),this.btnCancel=this.form.querySelector("#btnCancel")||null,this._editingId=null,this._setupCancel())}onSubmit(e){this.form.addEventListener("submit",i=>{i.preventDefault();const n=this._getFormData();e(n,this._editingId)})}enterEditMode(e){this._editingId=e,this.btnSubmit&&(this.btnSubmit.textContent="Actualizar"),this.btnCancel&&(this.btnCancel.style.display="inline-block")}exitEditMode(){this._editingId=null,this.btnSubmit&&(this.btnSubmit.textContent="Guardar"),this.btnCancel&&(this.btnCancel.style.display="none"),this.resetForm()}_setupCancel(){this.btnCancel&&this.btnCancel.addEventListener("click",()=>{this.exitEditMode()})}_getFormData(){throw new Error("Debes implementar _getFormData()")}fillForm(){throw new Error("Debes implementar fillForm()")}resetForm(){this.form.reset()}renderError(e){const i=document.querySelector("#app");if(!i){console.error(e);return}i.innerHTML=`
        <div class="alert alert-danger">
          ${e}
        </div>
      `}}class D extends B{constructor(){super({tableSelector:"#clientesTable tbody",formSelector:"#formCliente"})}buildRowCells(e){return`
      <td>${e.numeroCliente}</td>
      <td>${e.nombre}</td>
      <td>${e.apellido}</td>
      <td>${e.telefono}</td>
      <td>${e.domicilio} ${e.numeroDomicilio}</td>
      <td>${e.email}</td>
    `}_getFormData(){return{numeroCliente:document.getElementById("NumeroCliente").value,nombre:document.getElementById("clienteNombre").value,apellido:document.getElementById("clienteApellido").value,telefono:document.getElementById("clienteTelefono").value,domicilio:document.getElementById("clienteDomicilio").value,numeroDomicilio:document.getElementById("clienteNumeroDomicilio").value,email:document.getElementById("clienteEmail").value}}fillForm(e){document.getElementById("NumeroCliente").value=e.numeroCliente,document.getElementById("clienteNombre").value=e.nombre,document.getElementById("clienteApellido").value=e.apellido,document.getElementById("clienteTelefono").value=e.telefono,document.getElementById("clienteDomicilio").value=e.domicilio,document.getElementById("clienteNumeroDomicilio").value=e.numeroDomicilio,document.getElementById("clienteEmail").value=e.email,this.enterEditMode(e.id)}}function S(){const t=new D;new v({view:t,tokenProvider:y}).init()}export{S as initClientes};
