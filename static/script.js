triggerButton.addEventListener('click', () => {
    triggerButton.disabled = true;  // Disable the trigger button
    triggerButton.classList.remove('bg-blue-500');  // Remove the blue background
    triggerButton.classList.add('bg-gray-500');  // Add a gray background
    triggerButton.textContent = "Task in progress...";  // Change the button text
    statusDiv.textContent = "Be patient, it won't be long...";  // Set the initial status
    fetch('/apiworld')
        .then(response => response.json())
        .then(data => {
            let taskId = data.task_id;
            let isFetching = false;  // Add a flag to indicate whether a fetch request is in progress
            let intervalId = setInterval(() => {
                if (!isFetching) {  // Only send a new request if the previous one has completed
                    isFetching = true;  // Set the flag to true before sending the request
                    fetch(`/check_task/${taskId}`)
                        .then(response => response.json())
                        .then(data => {
                            let currentTime = new Date();
                            statusDiv.textContent = `Status at ${currentTime.toLocaleTimeString()}: ${data.status}`;  // Update the status DIV
                            if (data.status === 'SUCCESS') {
                                clearInterval(intervalId);
                                Swal.fire(
                                    'Good job!',
                                    'The task has been completed!',
                                    'success'
                                );
                                triggerButton.disabled = false;  // Re-enable the trigger button
                                triggerButton.classList.remove('bg-gray-500');  // Remove the gray background
                                triggerButton.classList.add('bg-blue-500');  // Add the blue background
                                triggerButton.textContent = "TRIGGER TEST TASK";  // Change the button text
                            }
                            isFetching = false;  // Set the flag to false after the request has completed
                        });
                }
            }, 500);  // Poll every 1/2 second
        });
});