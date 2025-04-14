# Technical Implementation Concepts

This document outlines the technical approach for implementing "Equilibrium", our light and dark balance game.

## Core Technical Components

### 1. Dimension System

The game revolves around two parallel dimensions (Light and Dark), so we need:

- **Dual Scene Rendering**: Using layers to manage what's visible in each dimension
- **Dimension State Manager**: A singleton that tracks which dimension the player is currently in
- **Transition Effects**: Visual effects when switching between dimensions

Implementation Approach:

- Create a single physical world with all objects
- Use layer masks and materials to control visibility based on current dimension
- Objects have properties defining which dimension(s) they exist in

### 2. Object Dimension Properties

Objects need to know which dimension they belong to:

- **Dimension Property**: Enum value (Light, Dark, Both) assigned to each object
- **Material Swapping**: Change object appearance based on current dimension
- **Visibility Controller**: Component that shows/hides objects based on dimension

For platforms that can shift between dimensions:

- Add a "DimensionShifter" component that manages transition between dimensions
- Track time spent on platform and shift progress
- Implement visual indicators for impending shifts

### 3. Platform System

Platforms are central to gameplay mechanics:

- **Platform Base Class**: Core functionality for all platforms
- **Dimension-Specific Platforms**: Only visible/solid in one dimension
- **Shared Platforms**: Visible in both dimensions with potential property differences
- **Shifting Platforms**: Track interaction time and handle dimension transitions
- **Special Platforms**: Safe zones, accelerated shifting, energy reversal effects

Implementation:

```
PlatformBase
  ├── LightPlatform
  ├── DarkPlatform
  ├── SharedPlatform
  └── ShiftingPlatform
      ├── StandardShifter (10-second timer)
      ├── FastShifter (5-second timer)
      └── SlowShifter (15-second timer)
```

### 4. Player Controller

The player needs special handling for dimension dynamics:

- **Player State Manager**: Tracks current dimension and handles transitions
- **Dual Energy System**: Manages both Light and Dark energy levels
- **Balance Effects**: Applies movement/visual changes based on energy imbalance
- **Dimension Switching**: Logic for changing dimensions with associated costs

Implementation:

- Player controller monitors input for dimension switch requests
- Validates energy levels before allowing dimension switch
- Applies movement penalties when energy is imbalanced
- Updates energy consumption/regeneration based on current state

### 5. Energy and Balance System

Core gameplay revolves around managing energy balance:

- **Dual Energy Trackers**: Two separate counters for Light and Dark energy
- **Energy Flow Manager**: Handles depletion and recharge rates
- **Balance Calculator**: Determines level of imbalance between energies
- **Effect Manager**: Applies gameplay effects based on balance state

Implementation:

- Energy components track current and maximum values
- Update method applies appropriate drain/recharge based on dimension
- Balance threshold triggers determine when effects activate
- Visual indicators show current energy levels and balance status

### 6. Interaction System

For crystals, portals, and other interactive elements:

- **Collectible System**: Handles crystal collection and effects
- **Portal Controller**: Manages level transitions
- **Trigger System**: For activating dimension-specific mechanics

Implementation:

- Use trigger colliders for interaction zones
- Implement event system for handling collectible effects
- Create portal transition effects that respect dimension state

### 7. Level Design Framework

To facilitate level creation:

- **Level Template**: Base structure for creating balanced levels
- **Zone Manager**: Handles grouping of multiple levels
- **Object Placement Tools**: Helpers for placing dimension-specific objects
- **Challenge System**: Framework for implementing optional challenges

## Development Approach

1. **Start with Core Mechanics**:
   - Implement dimension switching with basic rendering
   - Create simple player movement with dimension-awareness
   - Develop basic platform types (fixed in each dimension)

2. **Add Energy Management**:
   - Implement energy tracking and UI
   - Add dimension switch costs
   - Create basic balance effects

3. **Implement Platform Shifting**:
   - Add time-based dimension shifting to platforms
   - Create visual indicators for shifting
   - Test different shifting rates

4. **Add Progression Elements**:
   - Implement crystal collection
   - Create portals and level transitions
   - Design level structure

5. **Refinement**:
   - Balance energy consumption/regeneration rates
   - Fine-tune platform shifting timings
   - Polish visual transitions
