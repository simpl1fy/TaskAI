import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import CreateList from './CreateList';


const initialData = [
  {
    "title": "Project Alpha",
    "tasks": [
      { "title": "Setup environment", "status": false },
      { "title": "Build API", "status": false }
    ]
  },
  {
    "title": "Project Beta",
    "tasks": [
      { "title": "Design UI", "status": false }
    ]
  },
  {
    "title": "Project Gamma",
    "tasks": [
      { "title": "Research features", "status": false },
      { "title": "Write documentation", "status": false }
    ]
  },
  {
    "title": "Project Delta",
    "tasks": [
      { "title": "Create DB schema", "status": false }
    ]
  },
  {
    "title": "Project Epsilon",
    "tasks": [
      { "title": "Initial commit", "status": false },
      { "title": "Deploy to staging", "status": false }
    ]
  }
]


const TaskList = () => {

  const [data, setData] = useState(initialData);
  const [showSave, setShowSave] = useState(Array(data.length).fill(false));

  const handleChange = (listIndex:number, taskIndex:number) => {
    const newData = [...data];
    const task = newData[listIndex].tasks[taskIndex];
    task.status = !task.status;
    setData(newData);
    const newShowSave = [...showSave];
    if(newShowSave[listIndex]) {
      newShowSave[listIndex] = false;
    } else {
      newShowSave[listIndex] = true;
    }
    setShowSave(newShowSave);
  }

  return (
    <div className='shadow-lg p-4 rounded-lg'>
      <header className='flex justify-between mb-4'>
        <h3 className='text-2xl font-bold'>Your Tasks</h3>
        <CreateList />
      </header>
      <section className='flex flex-wrap gap-5'>
        {data.map((value, index) => (
          <div key={index} className='border border-gray-100 shadow-lg p-4 min-w-xs min-h-lh'>
            <h4 className='text-lg font-semibold'>{value.title}</h4>
            {value.tasks.map((tValue, tIndex) => (
              <label
                key={tIndex}
                className='flex items-center gap-2 mb-2 cursor-pointer'
              >
                <input 
                  type='checkbox'
                  checked={tValue.status}
                  onChange={() => handleChange(index, tIndex)}
                />
                <span className={`text-base ${tValue.status ? 'line-through text-gray-400': 'text-gray-800'}`}>
                  {tValue.title}
                </span>
              </label>
            ))}
            {showSave[index] && <Button>Save</Button>}
          </div>
        ))}
      </section>
    </div>
  )
}

export default TaskList
