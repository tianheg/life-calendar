// Create the grid of 90 years x 52 weeks = 4,680 rectangles
const createGrid = () => {
  const gridContainer = document.querySelector('.grid-container');
  gridContainer.innerHTML = ''; // Clear any existing grid
  
  // Create corner header
  const cornerHeader = document.createElement('div');
  cornerHeader.classList.add('grid-header', 'corner-header');
  cornerHeader.textContent = 'Yr/Wk';
  gridContainer.appendChild(cornerHeader);
  
  // Create column headers (weeks)
  for (let j = 0; j < 52; j++) {
    const colHeader = document.createElement('div');
    colHeader.classList.add('grid-header', 'col-header');
    colHeader.textContent = j + 1;
    gridContainer.appendChild(colHeader);
  }
  
  for (let i = 0; i < 90; i++) {
    // Create row headers (years)
    const rowHeader = document.createElement('div');
    rowHeader.classList.add('grid-header', 'row-header');
    rowHeader.textContent = i + 1;
    gridContainer.appendChild(rowHeader);
    
    // Create week cells
    for (let j = 0; j < 52; j++) {
      const gridItem = document.createElement('div');
      gridItem.classList.add('grid-item');
      gridItem.dataset.year = i;
      gridItem.dataset.week = j;
      gridContainer.appendChild(gridItem);
    }
  }
};

// Calculate the number of weeks since birth
const weeksSinceBirth = (birthYear) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Calculate age in years (current year - birth year)
  // Someone born in 2000 is (2025 - 2000) = 25 years old in 2025
  const age = currentYear - birthYear;
  
  // Get the current week of the current year (0-based)
  const start = new Date(currentYear, 0, 1);
  const diff = now - start;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeekOfYear = Math.floor(diff / oneWeek);
  
  // Calculate the total weeks: complete years * 52 + current week in the current year
  const totalWeeks = (age * 52) + currentWeekOfYear;
  
  return totalWeeks;
};

// Get the current week number (0-51)
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek);
};

// Fill the grid based on birth year
const fillGrid = (birthYear) => {
  // Calculate the age in years and current week
  const year = new Date().getFullYear() - birthYear; // Direct age calculation (e.g., 25)
  const currentWeek = getCurrentWeek(); // Current week of the year (0-51)
  
  // Convert to grid indexes (0-based)
  const currentYearIndex = year - 1; // Convert from 1-indexed display to 0-indexed storage
  
  // Only target grid items within the grid-container, not in the legend
  for (const item of document.querySelectorAll('.grid-container .grid-item')) {
    item.classList.remove('bg-time-passed');
    item.classList.remove('current-week');
  }
  
  // Fill in completed years
  for (let i = 0; i < currentYearIndex; i++) {
    // Color all weeks in completed years
    for (let j = 0; j < 52; j++) {
      const weekElement = document.querySelector(`.grid-container .grid-item[data-year="${i}"][data-week="${j}"]`);
      if (weekElement) {
        weekElement.classList.add('bg-time-passed');
      }
    }
  }
  
  // Fill in weeks of current year
  for (let j = 0; j <= currentWeek; j++) {
    const weekElement = document.querySelector(`.grid-container .grid-item[data-year="${currentYearIndex}"][data-week="${j}"]`);
    if (weekElement) {
      weekElement.classList.add('bg-time-passed');
    }
  }
  
  // Highlight the current week specifically
  const currentWeekElement = document.querySelector(`.grid-container .grid-item[data-year="${currentYearIndex}"][data-week="${currentWeek}"]`);
  if (currentWeekElement) {
    currentWeekElement.classList.add('current-week');
  }
};

// Handle the full screen toggle
const enableFullScreen = () => {
  const isFullScreen = new URLSearchParams(window.location.search).get("full_screen") === "true";
  document.querySelector(".text-container").hidden = isFullScreen;
};

const setFullScreen = () => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("full_screen", "true");
  window.location.search = urlParams;
};

// Handle PDF printing
const handlePrint = () => {
  // Store the current animation state of the current week
  const currentWeekElement = document.querySelector('.current-week');
  let animationState = null;
  
  if (currentWeekElement) {
    // Store the animation
    animationState = currentWeekElement.style.animation;
    // Disable animation for print
    currentWeekElement.style.animation = 'none';
  }
  
  // Force grid container to be visible and properly sized before printing
  const gridContainer = document.querySelector('.grid-container');
  if (gridContainer) {
    // Ensure grid is visible with !important styles
    gridContainer.setAttribute('style', 'display: grid !important; visibility: visible !important; width: 100% !important;');
    
    // Ensure all grid items are visible
    const gridItems = document.querySelectorAll('.grid-container .grid-item, .grid-container .grid-header');
    gridItems.forEach(item => {
      item.setAttribute('style', item.getAttribute('style') || '' + '; visibility: visible !important; display: block !important;');
    });
  }
  
  // Add a slight delay before printing to ensure styles are applied
  setTimeout(() => {
    window.print();
    
    // Restore animation after printing
    if (currentWeekElement && animationState !== null) {
      currentWeekElement.style.animation = animationState;
    }
    
    // Restore grid container styles
    if (gridContainer) {
      gridContainer.removeAttribute('style');
      
      // Restore grid items
      const gridItems = document.querySelectorAll('.grid-container .grid-item, .grid-container .grid-header');
      gridItems.forEach(item => {
        // Only remove the visibility and display styles we added
        const style = item.getAttribute('style') || '';
        item.setAttribute('style', style.replace(/visibility:[^;]+!important;?|display:[^;]+!important;?/g, ''));
      });
    }
  }, 100);
};

// Initialize calendar with default value or stored value
const initializeCalendar = () => {
  // Try to get saved birth year from localStorage
  const birthYear = localStorage.getItem('birthYear') || 2000;
  document.getElementById('birth-year').value = birthYear;
  createGrid();
  fillGrid(birthYear);
};

document.addEventListener('DOMContentLoaded', () => {
  // Handle keyboard shortcut for full screen
  window.addEventListener("keydown", event => {
    if ((event.metaKey || event.ctrlKey) && (event.key === "E" || event.key === "e")) setFullScreen();
  });
  
  // Handle update button click
  document.getElementById('update-grid').addEventListener('click', () => {
    const birthYearInput = document.getElementById('birth-year');
    const birthYear = birthYearInput.value;
    
    // Validate input
    if (birthYear && !Number.isNaN(birthYear) && birthYear >= 1900 && birthYear <= new Date().getFullYear()) {
      // Save to localStorage
      localStorage.setItem('birthYear', birthYear);
      fillGrid(birthYear);
    } else {
      alert('Please enter a valid birth year between 1900 and the current year.');
    }
  });
  
  // Add event listener for print button
  document.getElementById('print-button').addEventListener('click', handlePrint);
  
  enableFullScreen();
  initializeCalendar();
});