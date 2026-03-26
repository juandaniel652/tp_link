import{o,C as r,c as l,a as s,e as a}from"./clientes.service-BkWGR-dy.js";import{t as d}from"./tokenStorage-BJFfxEW5.js";import"./clientes.api-BWliis89.js";import"./api-Bv_3k0DF.js";class c{constructor({view:e,tokenProvider:t}){this.view=e,this.tokenProvider=t,this.clientes=[],this.clienteEditando=null}async init(){this.bindEvents(),await this.cargarClientes()}bindEvents(){this.view.onSubmit(e=>this.handleGuardar(e)),this.view.onEdit(e=>this.handleEditar(e)),this.view.onDelete(e=>this.handleEliminar(e))}async cargarClientes(){try{const e=this.tokenProvider.getToken();this.clientes=await o(e),this.view.render(this.clientes)}catch(e){this.view.renderError(e.message)}}async handleGuardar(e){try{const t=this.tokenProvider.getToken(),i=new r({...e,id:this.clienteEditando?.id??null});this.clienteEditando?(await s(i,t),this.clienteEditando=null):await l(i,t),await this.cargarClientes(),this.view.resetForm()}catch(t){this.view.renderError(t.message)}}handleEditar(e){const t=this.clientes.find(i=>i.id===e);t&&(this.clienteEditando=t,this.view.fillForm(t))}async handleEliminar(e){if(confirm("¿Eliminar cliente?"))try{const i=this.tokenProvider.getToken();await a(e,i),await this.cargarClientes()}catch(i){this.view.renderError(i.message)}}}class m{constructor(e){this.tableBody=document.querySelector(e)}onEdit(e){this._onEdit=e}onDelete(e){this._onDelete=e}render(e){if(this.tableBody.innerHTML="",!e||!e.length){this.tableBody.innerHTML=`
        <tr>
          <td colspan="100%">No hay registros</td>
        </tr>
      `;return}e.forEach(t=>{const i=document.createElement("tr");i.innerHTML=`
        ${this.buildRowCells(t)}
        <td>
          <button type="button" class="btn-edit">✏️</button>
          <button type="button" class="btn-delete">🗑️</button>
        </td>
      `,i.querySelector(".btn-edit").onclick=()=>{this._onEdit?.(t.id)},i.querySelector(".btn-delete").onclick=()=>{this._onDelete?.(t.id)},this.tableBody.appendChild(i)})}buildRowCells(){throw new Error("Debes implementar buildRowCells en la clase hija")}showError(e){console.error(e),this.tableBody&&(this.tableBody.innerHTML=`
      <tr>
        <td colspan="100%" style="color:red">
          ${e}
        </td>
      </tr>
    `)}}class u extends m{constructor({tableSelector:e,formSelector:t}){super(e),this.form=document.querySelector(t),this.form&&(this.btnSubmit=this.form.querySelector("[type='submit']"),this.btnCancel=this.form.querySelector("#btnCancel")||null,this._editingId=null,this._setupCancel())}onSubmit(e){this.form.addEventListener("submit",t=>{t.preventDefault();const i=this._getFormData();e(i,this._editingId)})}enterEditMode(e){this._editingId=e,this.btnSubmit&&(this.btnSubmit.textContent="Actualizar"),this.btnCancel&&(this.btnCancel.style.display="inline-block")}exitEditMode(){this._editingId=null,this.btnSubmit&&(this.btnSubmit.textContent="Guardar"),this.btnCancel&&(this.btnCancel.style.display="none"),this.resetForm()}_setupCancel(){this.btnCancel&&this.btnCancel.addEventListener("click",()=>{this.exitEditMode()})}_getFormData(){throw new Error("Debes implementar _getFormData()")}fillForm(){throw new Error("Debes implementar fillForm()")}resetForm(){this.form.reset()}renderError(e){const t=document.querySelector("#app");if(!t){console.error(e);return}t.innerHTML=`
        <div class="alert alert-danger">
          ${e}
        </div>
      `}}class h extends u{constructor(){super({tableSelector:"#clientesTable tbody",formSelector:"#formCliente"})}buildRowCells(e){return`
      <td>${e.numeroCliente}</td>
      <td>${e.nombre}</td>
      <td>${e.apellido}</td>
      <td>${e.telefono}</td>
      <td>${e.domicilio} ${e.numeroDomicilio}</td>
      <td>${e.email}</td>
    `}_getFormData(){return{numeroCliente:document.getElementById("NumeroCliente").value,nombre:document.getElementById("clienteNombre").value,apellido:document.getElementById("clienteApellido").value,telefono:document.getElementById("clienteTelefono").value,domicilio:document.getElementById("clienteDomicilio").value,numeroDomicilio:document.getElementById("clienteNumeroDomicilio").value,email:document.getElementById("clienteEmail").value}}fillForm(e){document.getElementById("NumeroCliente").value=e.numeroCliente,document.getElementById("clienteNombre").value=e.nombre,document.getElementById("clienteApellido").value=e.apellido,document.getElementById("clienteTelefono").value=e.telefono,document.getElementById("clienteDomicilio").value=e.domicilio,document.getElementById("clienteNumeroDomicilio").value=e.numeroDomicilio,document.getElementById("clienteEmail").value=e.email,this.enterEditMode(e.id)}}function C(){const n=new h;new c({view:n,tokenProvider:d}).init()}export{C as initClientes};
