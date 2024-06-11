App = {
  contracts: {},
  loading: false,

  load: async () => {
      await App.loadWeb3();
      await App.loadAccounts();
      await App.loadContract();
      await App.render();
  },
 
  loadWeb3: async () => {
    window.addEventListener('load', async () => {
      if (window.ethereum) {
          window.web3 = new Web3(ethereum);
          try {
              await ethereum.enable();
              web3.eth.sendTransaction({/* ... */});
          } catch (error) {
              console.log("User denied account access...");
          }
      } else if (window.web3) {
          window.web3 = new Web3(web3.currentProvider);
          web3.eth.sendTransaction({/* ... */});
      } else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
      });
  },

  loadAccounts: async () => {
      App.account = await ethereum.request({ method: 'eth_accounts' });
      console.log(App.account);
  },

  loadContract: async () => {
      const todoList = await $.getJSON('TodoList.json');
      App.contracts.TodoList = TruffleContract(todoList);
      App.contracts.TodoList.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
      App.todoList = await App.contracts.TodoList.deployed();
  },

  render: async () => {
      if (App.loading) {
          return;
      }

      App.setLoading(true);
      $('#account').html(App.account);
      await App.renderTasks();
      App.setLoading(false);
  },

  renderTasks: async () => {
      const taskCount = await App.todoList.taskCount();
      const $taskTemplate = $(".taskTemplate");

      for (var i = 1; i <= taskCount; i++) {
          const task = await App.todoList.tasks(i);
          const task_id = task[0].toNumber();
          const task_content = task[1];
          const task_completed = task[2];
          const task_deadline = task[3];
          const display_deadline = task_deadline ? task_deadline : "No due";

          const $newTaskTemplate = $taskTemplate.clone();
          $newTaskTemplate.find('.content').html(`${task_content} <span class='due-date'>(${display_deadline})</span>`);
          $newTaskTemplate.find('input')
                          .prop('name', task_id)
                          .prop('checked', task_completed)
                          .on('click', App.toggleCompleted);

          if (task_completed) {
              $('#completedTaskList').append($newTaskTemplate);
          } else {
              $('#taskList').append($newTaskTemplate);
          }
  
          $newTaskTemplate.show();
      }
  },

  setLoading: (boolean) => {
      App.loading = boolean;
      const loader = $('#loader');
      const content = $('#content');
      if (boolean) {
          loader.show();
          content.hide();
      } else {
          loader.hide();
          content.show();
      }
  },

  createTask: async () => {
      App.setLoading(true);
      const content = $('#newTask').val();
      const deadline = $('#taskDeadline').val() || "No due";
      await App.todoList.createTask(content, deadline, { from: App.account[0], gas: 300000 });
      window.location.reload();
  },

  toggleCompleted: async (e) => {
      App.setLoading(true);
      const taskId = e.target.name;
      await App.todoList.toggleCompleted(taskId, { from: App.account[0] });
      window.location.reload();
  },
}

$(() => {
  $(window).load(() => {
      App.load();
  });
});
