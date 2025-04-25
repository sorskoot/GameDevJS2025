import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';

import { vec3 } from 'gl-matrix';

/**
 * Reusable vector for position calculations to avoid garbage collection
 */
const tempVec3 = vec3.create();

/**
 * Secondary reusable vector for calculations to avoid garbage collection
 */
const tempVec3_2 = vec3.create();

/**
 * Base component for particle systems in Wonderland Engine
 * Handles creation, lifecycle management and updating of particle objects
 */
export class ParticlesBase extends Component {
    static TypeName = 'particles-base';

    /**
     * Object to clone for each particle in the system
     */
    @property.object({ required: true })
    particlePrefab!: Object3D;

    /**
     * Time delay between particle spawns in seconds
     */
    @property.float(0.1)
    delay!: number;

    /**
     * Maximum number of particles that can exist at once
     */
    @property.int(1500)
    maxParticles!: number;

    /**
     * Scale factor applied to each particle
     */
    @property.float(0.01)
    particleScale!: number;

    /**
     * The time in seconds the particles will live for
     */
    @property.float(1)
    lifeTime = 1;

    /**
     * Size parameter for the particle system
     */
    @property.int(16)
    size!: number;

    /**
     * Elapsed time since particle system started
     */
    time: number = 0.0;

    /**
     * Number of particles spawned so far
     */
    count: number = 0;

    /**
     * Collection of all particle objects
     */
    private _objects: Object3D[] = [];

    /**
     * Initializes the particle system by creating all potential particles
     * and spawning the initial batch
     */
    start() {
        this._objects = [];
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particlePrefab.clone(this.object);
            p.resetPositionRotation();
            p.scaleLocal([0, 0, 0]);

            this.initParticle(p, i);

            this._objects.push(p);
        }

        // /* Time to spawn particles */
        for (let i = 0; i < this.maxParticles; ++i) {
            this.spawn();
        }
    }

    /**
     * Override this function to initialize the particle object.
     * This is called for every particle when initialized
     * @param particle A particle object to initialize
     * @param index The index of the particle
     */
    initParticle(particle: Object3D, index: number) {}

    /**
     * Override this function to update a particle object.
     * This is called for every active particle each frame
     * @param particle A particle object to update
     * @param index The index of the particle
     * @param dt Delta time in seconds since last update
     */
    updateParticle(particle: Object3D, index: number, dt: number) {}

    /**
     * Called when a particle is spawned
     * Override to customize behavior when a particle appears
     * @param particle The particle object that was just spawned
     * @param index The index of the spawned particle
     */
    onParticleSpawn(particle: Object3D, index: number) {}

    /**
     * Updates the particle system each frame
     * Handles particle lifetime and updates individual particles
     * @param dt Delta time in seconds since last update
     */
    update(dt: number) {
        this.time += dt;
        if (this.time > this.lifeTime) {
            for (let i = 0; i < this.count; i++) {
                this._objects[i].destroy();
            }
            this.object.destroy();
            return;
        }
        for (let i = 0; i < this.count; i++) {
            this.updateParticle(this._objects[i], i, dt);
        }
    }

    /**
     * Spawns a new particle or reuses an existing one if at max capacity
     */
    spawn() {
        let index = this.count % this.maxParticles;

        let obj = this._objects[index];
        obj.resetTransform();
        obj.scaleLocal([
            this.particleScale,
            this.particleScale,
            this.particleScale,
        ]);
        this.object.getPositionWorld(tempVec3);
        obj.setPositionWorld(tempVec3);

        this.onParticleSpawn(obj, index);

        this.count += 1;
    }
}

/**
 * Specialized particle system for death effects
 * Creates particles that scatter outward from a central point and fade out
 */
export class DeathParticles extends ParticlesBase {
    static TypeName = 'death-particles';
    static InheritProperties = true;

    /**
     * Initial speed of particles when spawned
     */
    @property.float(15)
    initialSpeed!: number;

    /**
     * Velocity vectors for each particle
     */
    private _velocities: vec3[] = [];

    /**
     * Speed values for each particle
     */
    private _speeds: number[] = [];

    /**
     * Direction vectors for each particle
     */
    private _direction: vec3[] = [];

    /**
     * Current scale values for each particle
     */
    private _scales: number[] = [];

    /**
     * Initialize the death particle system
     */
    start(): void {
        super.start();
    }

    /**
     * Sets up initial properties for each death particle
     * @param particle The particle object to initialize
     * @param index The index of the particle
     */
    override initParticle(particle: Object3D, index: number): void {
        this._speeds[index] = Math.random() * this.initialSpeed + 0.5;
        this._direction[index] = vec3.normalize(vec3.create(), [
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            0, // not moving in Z direction
        ]);
        this._scales[index] = this.particleScale;
    }

    /**
     * Updates a death particle's position and scale each frame
     * Particles move outward and gradually shrink until disappearing
     * @param particle The particle object to update
     * @param index The index of the particle
     * @param dt Delta time in seconds since last update
     */
    override updateParticle(
        particle: Object3D,
        index: number,
        dt: number
    ): void {
        particle.getPositionWorld(tempVec3);
        vec3.add(
            tempVec3,
            tempVec3,
            vec3.scale(
                tempVec3_2,
                this._direction[index],
                this._speeds[index] * dt
            )
        );
        if (this._scales[index] > 0) {
            this._scales[index] -= dt;
            if (this._scales[index] < 0) {
                this._scales[index] = 0;
            }
            particle.setScalingLocal([
                this._scales[index],
                this._scales[index],
                this._scales[index],
            ]);
        }
        particle.setPositionWorld(tempVec3);
    }
}
