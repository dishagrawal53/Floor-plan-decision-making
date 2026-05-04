# 🏠 Plan Insight  
### Floor Plan Analysis & Visualization System

A full-stack decision support system for **selecting and visualizing residential floor plans** using dataset-driven filtering, spatial analysis, and interactive 2D/3D design tools.

---

## 📌 Problem

Designing residential layouts requires architectural expertise and multiple iterations. Existing tools either generate layouts or lack structured evaluation, making it difficult for users to compare and choose efficient designs.

---

## 🧠 Approach

- Utilized the **ResPlan dataset (17,000+ layouts)** with polygon-based representations  
- Implemented **geometric filtering + rule-based evaluation** (space utilization & orientation analysis)  
- Built an **interactive system** for selection, comparison, and visualization of layouts  

---

## 🚀 Features

- 🔍 Filter floor plans based on area, rooms, and features  
- 📐 Evaluate layouts using **space efficiency & directional analysis**  
- 🖼️ 2D visualization using GeoPandas & Matplotlib  
- 🛋️ Interactive 2D furniture placement (drag & drop)  
- 🧊 Real-time 3D visualization using Three.js  

---

## 📸 Output

### 🏠 Floor Plan Selection Interface
<p align="center">
  <img src="https://github.com/user-attachments/assets/d10ae601-e0ff-44fc-9731-71426ea54a5d" width="70%"/>
</p>

### 🛋️ 2D Furniture Placement Interface
<p align="center">
  <img src="https://github.com/user-attachments/assets/900f5dd4-07c6-4c56-9483-448d93e92755" width="80%"/>
</p>

### 🧊 3D Floor Plan Visualization
<p align="center">
  <img src="https://github.com/user-attachments/assets/5b5bece4-1c57-41fd-9a51-e344efb3a80f" width="75%"/>
</p>

---

## 🏗️ Tech Stack

**Backend:**  
Python, FastAPI, Shapely, GeoPandas, NumPy, Matplotlib  

**Frontend:**  
React.js, HTML5 Canvas, Three.js  

**Communication:**  
REST APIs (JSON)

