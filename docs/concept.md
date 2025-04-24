# Light and Dark Balance Game Concept

Based on your idea and the GameDevJS 2025 "Balance" theme, here's a game concept that uses simple 3D geometry while focusing on the balance between light and dark:

## Core Concept: "Equilibrium"

A 3D platformer/puzzle game where you navigate through a world that exists in two states - Light and Dark - and you must maintain balance between them.

## Game Objectives and Progression

Core Game Goal:

- Restore balance to a fractured world by reuniting the Light and Dark dimensions
- Progress through increasingly complex environments to reach the central something where dimensions can be realigned (outside of score for the jam?)

Level Structure:

- Each level represents a fragment of the world that needs rebalancing
- Levels are organized into zones (3-5 levels per zone), each with a distinct visual theme
- Complete all levels in a zone to unlock the next zone

Level Objectives:

- Primary Goal: Reach the "Balance Portal" at the end of each level to progress
- Secondary Goal: Collect Red Crystals scattered throughout the level
  - Collecting all crystals in a level unlocks bonus content (alternative paths, cosmetics)
  - Crystals also serve the gameplay purpose of temporarily restoring balance between energies
- Optional Challenges: Complete the level within a time limit or with minimal dimension switches

Progression System:

- Completing levels unlocks new abilities that enhance dimension manipulation
- Collecting specific numbers of crystals unlocks special areas with lore elements
- Successfully maintaining balanced energy throughout a level grants bonus rewards

Final Challenge:

- The ultimate goal is to reach and activate the "Equilibrium Nexus" in the final level
- This requires mastery of both dimension switching and energy management
- The final sequence requires perfect balance of both energy types

## Game Mechanics

World Switching:

- Two Parallel Dimensions: Light world (white platforms on black background) and Dark world (black platforms on white background)
- Each world has unique platforms, obstacles, and paths
- Some platforms exist in both worlds but may have different properties

Platform Dynamics:

- Platforms gradually shift to the opposite dimension after standing on them for 10 seconds
- Jumping on a platform accelerates this shifting process
- Creates natural urgency and forces strategic movement
- Some special "stable" platforms may exist that don't shift

Energy System:

- Dual Energy Meters: Light Energy and Dark Energy
- Light Energy depletes while in the Dark world and recharges in the Light world
- Dark Energy depletes while in the Light world and recharges in the Dark world
- Moving drains energy from your current world's energy supply
- Taking damage from hazards or enemies costs significant energy
- Switching worlds costs energy of the world you're entering
- If your energy for a particular world reaches zero, you cannot enter that world until it recharges

Balance Consequences:

- Imbalance Effects: If one energy type gets too high compared to the other:
  - Movement becomes sluggish
  - Jump height decreases
  - Vision becomes distorted
  - Platforms may start to fade/become unstable

Gameplay Elements:

- Red Crystals: Special objects that exist in both dimensions simultaneously (like the red cube in your concept art)
  - Collecting these temporarily restores balance between energies
  - Could be main collectibles/objectives
- Dimension-Specific Hazards: Obstacles that drain energy faster
- Timed Challenges: Sections requiring quick switching between worlds
- Strategic Planning: Players must balance platform hopping (causing shifts) against energy conservation

Progression Ideas:

- Start with simple level design teaching the basic switching mechanic
- Introduce energy management challenges
- Create puzzles that require strategic switching and balance maintenance
- Develop more complex levels with platform shifting puzzles
- Late-game levels that require mastery of platform shifting timing

Visual Style:

- Minimalist geometric shapes with high contrast
- White objects on black background in Light world
- Black objects on white background in Dark world
- Red elements for important objects that exist in both worlds
- Simple particle effects for transitions between worlds
- Visual indicators showing platforms about to shift (subtle pulsing or color change)

Additional Ideas:

- Special platforms that reverse energy flow (Light platforms in Dark world and vice versa)
- "Safe zones" where platforms don't shift, allowing players to strategize
- Platforms that shift at different rates (fast/slow shifting challenges)
- Enemies that can only be defeated in a specific world
- Sound design that shifts between calm and tense based on energy balance

This concept should be achievable with simple geometry while still offering engaging gameplay centered around the balance theme.

## Plan

Here's a potential initial implementation plan to get the core mechanics working:

1. **Player Controller:**
    - Implement basic movement (left/right, forward/back).
    - Implement jumping.
    - Implement collision detection and response with world geometry.
2. **Dimension Switching:**
    - Create the mechanism to toggle between Light and Dark dimensions.
    - Switch active platform sets based on the current dimension.
    - Update visual background/foreground accordingly.
3. **Basic Objects:**
    - Create a simple 3D representation for the player.
    - Create basic static platform objects for both Light and Dark worlds.
    - Create a simple representation for collectible Crystals (e.g., red cubes).
    - Create a simple representation for the end-of-level Portal.
4. **Energy System:**
    - Implement Light and Dark energy variables.
    - Implement depletion logic when in the opposite dimension.
    - Implement recharge logic when in the corresponding dimension.
    - Implement energy cost for switching dimensions.
5. **Platform Shifting Mechanic:**
    - Detect when the player lands on a platform.
    - Start a timer for the platform to shift dimensions.
    - Implement the visual change and collision change when a platform shifts.
6. **Basic UI:**
    - Display simple bars or indicators for the current Light and Dark energy levels.

---

## Energy as Health

- Switching worlds draws energy

Mechanic: Getting hit by enemies or specific hazards drains a chunk of your energy.

- Getting hit in the Light World drains your Dark Energy (because that's what you'd need to escape to).
- Getting hit in the Dark World drains your Light Energy.
Failure Condition: If either energy type hits zero, you "overload" or "destabilize" – maybe a flashy visual effect, and you reset to the last stable checkpoint (perhaps the last "Red" platform you touched).
Pros:
- Highly Thematic: Directly ties damage/risk to the core balancing mechanic. Every hit impacts your ability to switch worlds, reinforcing the interdependence.
- Focused: Keeps the player managing only the two core energy resources. No separate health bar needed.
- Potentially Simpler: Resetting to a checkpoint might be simpler to implement than complex death states/animations.
Cons:
Can be frustrating if energy drains too fast or checkpoints are too far apart. Needs careful balancing.

---

### 1. **Energy as a Core Resource**

- **Switching Cost:**
  - Switching to Light drains Light energy; switching to Dark drains Dark energy.
  - If you don’t have enough energy, you can’t switch—forcing players to plan ahead.

- **Passive Drain/Recharge:**
  - While in Light, Dark energy slowly recharges, and vice versa.
  - Moving, jumping, or using abilities could increase the drain rate.

---

### 2. **Puzzle Difficulty Levers**

- **Platform Placement:**
  - Place platforms so that the optimal path requires careful timing of switches.
  - Some platforms only exist in one dimension, requiring a switch mid-jump.

- **Energy Management:**
  - Force players to cross long stretches in one dimension, risking running out of energy.
  - Place energy pickups or "safe zones" strategically, so players must detour or take risks.

- **Hazards & Enemies:**
  - Hazards that drain energy faster or block recharge.
  - Enemies that can only be defeated in one dimension, requiring a switch and energy cost.

- **Shifting Platforms:**
  - Platforms that shift dimension after standing on them for a few seconds, forcing quick decisions.
  - Some platforms could "lock" you in a dimension temporarily, draining energy until you escape.

---

### 3. **Game Systems to Build**

- **Energy UI:**
  - Clear bars for Light and Dark energy.
  - Warnings when energy is low or switching is unavailable.

- **Checkpoints:**
  - Reset player to last "Red" platform or checkpoint if energy hits zero.

- **Collectibles:**
  - Crystals that restore both energies or temporarily allow free switching.

- **Level Design Tools:**
  - Editor support for marking which platforms exist in which dimension.
  - Triggers for hazards, energy pickups, and shifting platforms.

---

### 4. **Making It a Game**

- **Challenge:**
  - Players must route-plan: which dimension, when to switch, how to conserve energy.
  - Optional challenges: complete with minimal switches, collect all crystals, speedrun.

- **Progression:**
  - New abilities: double-jump, dash, or temporary invulnerability—each with energy costs.
  - Increasingly complex platform layouts and energy management puzzles.

- **Feedback:**
  - Visual/audio cues for low energy, successful switches, and energy pickups.
  - Effects for imbalance (e.g., screen distortion, sluggish controls).

---

### 5. **Extra Ideas**

- **Imbalance Effects:**
  - If one energy is much higher than the other, introduce negative effects (slower movement, unstable platforms).
- **Timed Sections:**
  - Areas where energy drains faster, forcing quick navigation.
- **Energy Reversal Zones:**
  - Special platforms or zones where energy rules are flipped.
- **Other**
  - Plates on the ground that switch to dark or light when stepped on
  - moving platforms
  - platforms that flip between dark and light

---

**Summary:**
To make the energy system central to your platforming puzzles, design levels that force players to think about when and where to switch, how to conserve and restore energy, and how to deal with hazards that interact with their energy. The tension between needing to switch and the risk of running out of energy is what will drive interesting decisions and challenge.
