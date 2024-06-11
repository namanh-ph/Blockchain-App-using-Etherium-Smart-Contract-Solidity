pragma solidity ^0.5.0;

contract TodoList {
  uint public taskCount = 0;

  struct Task {
    uint id;
    string content;
    bool completed;
    string deadline;
  }

  mapping(uint => Task) public tasks;

  event TaskCreated(
    uint id,
    string content,
    bool completed,
    string deadline
  );

  event TaskCompleted(
    uint id,
    bool completed
  );

  constructor() public {
    createTask("New Task", "No due");
  }

  function createTask(string memory _content, string memory _deadline) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false, _deadline);
    emit TaskCreated(taskCount, _content, false, _deadline);
  }

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

}