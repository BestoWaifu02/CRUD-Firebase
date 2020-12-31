//Una coleccion en FIREBASE es un conjunto de datos
const db = firebase.firestore();
//Formulario
const taskForm = document.getElementById("task-form");
const tasksContainer = document.getElementById("tasks-container");

//Estado de editar
let editStatus = false;
let id = "";

/**
 * Save a New Task in Firestore
 * @param {string} title the title of the Task
 * @param {string} description the description of the Task
 */
const saveTask = (title, description) =>
  //Retorna undefind porque solo gaurda y no responde

  db.collection("tasks").doc().set({
    //Al asignar valores como son repetidos por que tienen el mismo nombre JS moderno te permite dejarle solo 1 nombre
    title,
    description,
  });

const getTasks = () => db.collection("tasks").get();

//De la coleccion de tareas cada vez que algo cambie voy a manejarlo con una funcion
const onGetTasks = (callback) => db.collection("tasks").onSnapshot(callback);

const deleteTask = (id) => db.collection("tasks").doc(id).delete();
//Obtener tarea segun su ID
const getTask = (id) => db.collection("tasks").doc(id).get();
//Actualizar tarea (pasamos ID y campos)
const updateTask = (id, updatedTask) =>
  db.collection("tasks").doc(id).update(updatedTask);
//Al objeto window cuando se inicia ejecuta la funcion getTasks()

window.addEventListener("DOMContentLoaded", async (e) => {
  onGetTasks((querySnapshot) => {
    tasksContainer.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const task = doc.data();

      tasksContainer.innerHTML += `<div class="card card-body mt-2 border-primary">
    <h3 class="h5">${task.title}</h3>
    <p>${task.description}</p>
    <div>
      <button class="btn btn-primary btn-delete" data-id="${doc.id}">
        🗑 Delete
      </button>
      <button class="btn btn-secondary btn-edit" data-id="${doc.id}">
        🖉 Edit
      </button>
    </div>
  </div>`;
    });

    //Capturamos el evento para borrar
    const btnsDelete = tasksContainer.querySelectorAll(".btn-delete");
    //Recorremos todos los botones para agregarles un evento de listener

    btnsDelete.forEach((btn) =>
      btn.addEventListener("click", async (e) => {
        console.log(e.target.dataset.id);
        try {
          await deleteTask(e.target.dataset.id);
        } catch (error) {
          console.log(error);
        }
      })
    );

    const btnsEdit = tasksContainer.querySelectorAll(".btn-edit");
    //Recorremos todos los botones para agregarles un evento de listener
    btnsEdit.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        try {
          //Obtenemos los datos con el getTask() y se los pasamos al FORM
          const doc = await getTask(e.target.dataset.id);
          const task = doc.data();
          taskForm["task-title"].value = task.title;
          taskForm["task-description"].value = task.description;
          //Le ponemos al formulario el status de editar
          editStatus = true;
          id = doc.id;
          taskForm["btn-task-form"].innerText = "Update";
        } catch (error) {
          console.log(error);
        }
      });
    });
  });
});
//Evento del FORM "SUBMIT"
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  //Aqui solo guardamos el elemento

  const title = taskForm["task-title"];
  const description = taskForm["task-description"];

  try {
    //Si el edit status es falso es porque va a guardar
    if (!editStatus) {
      //Pasamos las const que son el elemento pero su .value

      await saveTask(title.value, description.value);
    } else {
      await updateTask(id, {
        title: title.value,
        description: description.value,
      });
      //Cuando se acaba de editar ahora el formulario vuelve al estado de guardar y no editar
      editStatus = false;
      id = "";
      taskForm["btn-task-form"].innerText = "Save";
    }

    taskForm.reset();
    title.focus();
  } catch (error) {
    console.log(error);
  }
});
