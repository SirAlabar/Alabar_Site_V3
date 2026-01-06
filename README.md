# Alabar Site V3 🎮  
**Interactive Game-Driven Portfolio & Survivor-Style Game Engine**

Alabar Site V3 is an interactive portfolio where the website itself becomes a playable experience.  
Instead of a traditional static site, this project integrates a **custom-built survivor-style game engine** directly into the portfolio, focusing on **gameplay systems, architecture, and scalability**.

At its core is **Survivor Arena**, a Vampire Survivors–inspired game loop built from scratch using **TypeScript** and **Pixi.js**, designed with engine-like principles rather than framework-dependent shortcuts.

---

## 🚀 Live Demo

🔗 **Live:** https://siralabar.pages.dev/  

---

## 🧩 Project Goals

- Explore **game engine architecture** in a browser environment  
- Design **scalable gameplay systems** without relying on a full game engine  
- Apply **ECS-inspired patterns** using OOP and modular systems  
- Build a **data-driven game loop** focused on extensibility and performance  
- Integrate gameplay seamlessly into a portfolio website  

---

## 🎮 Survivor Arena – Core Features

- Complete survivor-style game loop  
- Abstract entity hierarchy (`BaseEntity`, `MonsterBase`, etc.)  
- Modular combat systems:
  - Melee  
  - Ranged  
  - Area-of-effect (AoE)  
- Dynamic enemy spawning and wave scaling  
- Drop & pickup system with rarity logic  
- Level-up cards and progression system  

---

## 🧠 Architecture Overview

The project follows an **ECS-inspired architecture**, emphasizing separation of concerns:

- **Entities**  
  - Represent game objects (player, enemies, projectiles, pickups)  
  - Contain minimal logic and delegate behavior to systems  

- **Systems**  
  - Handle movement, combat, collisions, spawning, and progression  
  - Operate on groups of entities each frame  

- **Game State**  
  - Centralized control of progression, waves, difficulty, and runtime state  

This structure allows:
- Easy addition of new enemies, abilities, or mechanics  
- Minimal coupling between gameplay features  
- Clear scalability as the project grows  

---

## 🗂️ Asset Management & Pipeline

A significant part of the project focused on **runtime stability and performance**:

- Centralized **asset loading and preload system**
- Predictable initialization flow before entering the game loop
- **Spritesheet-based animations** for characters, effects, and UI
- JSON-driven metadata for:
  - Enemies
  - Abilities
  - Items
  - Progression values
- Asset loading decoupled from gameplay logic to avoid runtime stutters

This approach mirrors common practices in real game engines.

---

## 🌌 Portfolio & Presentation Layer

Beyond the game engine, the project includes:

- Canvas-based rendering using **Pixi.js**
- RPG-style navigation flow
- CSS/JS environmental animations:
  - Moving clouds
  - Moon cycle
- Integration between:
  - DOM-based UI
  - Real-time canvas rendering
- Projects, contact, and portfolio sections embedded into the experience

---

## 🛠️ Tech Stack

- **TypeScript**
- **Pixi.js**
- **Canvas API**
- **HTML / CSS**
- **ECS-inspired architecture**
- **OOP design patterns**

---

## 🧪 Key Challenges Solved

- Coordinating multiple real-time systems safely
- Managing collisions and damage efficiently at scale
- Designing a flexible monster hierarchy
- Balancing difficulty dynamically while maintaining performance
- Keeping the architecture extensible without a full engine framework

---

## 📚 What This Project Represents

This project reflects how I approach:

- Gameplay systems design  
- Engine-like architecture  
- Asset pipelines and runtime performance  
- Data-driven balancing and progression  
- Maintainable, extensible codebases  

The same principles apply whether building **games, tools, or interactive experiences**.

---

## 📬 Feedback

Feedback, suggestions, and discussions are very welcome.  
Feel free to open an issue or reach out.

