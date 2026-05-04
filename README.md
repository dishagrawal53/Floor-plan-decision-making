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
  <img width="611" height="540" alt="2" src="https://github.com/user-attachments/assets/29e61664-61eb-4832-aba1-5c15ff8940b0" />

</p>

### 🛋️ 2D Furniture Placement Interface
<p align="center">
  <img width="854" height="591" alt="5" src="https://github.com/user-attachments/assets/c6cc5ea2-19cc-42dc-8d94-8ffa72686f66" />

</p>

### 🧊 3D Floor Plan Visualization
<p align="center">
 <img width="1366" height="648" alt="6" src="https://github.com/user-attachments/assets/51833556-eeb1-400e-8739-0c8f2ff98b8e" />

</p>

---

## 🏗️ Tech Stack

**Backend:**  
Python, FastAPI, Shapely, GeoPandas, NumPy, Matplotlib  

**Frontend:**  
React.js, HTML5 Canvas, Three.js  

**Communication:**  
REST APIs (JSON)

