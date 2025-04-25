import { wlUtils } from '@sorskoot/wonderland-components';
import {
    Component,
    Object3D,
    MeshComponent,
    Mesh,
    Material,
} from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';

import { quat2, vec3 } from 'gl-matrix';

const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();

export class ParticlesBase extends Component {
    static TypeName = 'particles-base';

    @property.object({ required: true })
    particlePrefab!: Object3D;

    @property.float(0.1)
    delay!: number;

    @property.int(1500)
    maxParticles!: number;

    @property.float(0.01)
    particleScale!: number;

    /**
     * The time in seconds the particles will live for
     */
    @property.float(1)
    lifeTime = 1;

    @property.int(16)
    size!: number;

    time: number = 0.0;
    count: number = 0;

    /**
     * @type {Object3D[]}
     */
    private _objects: Object3D[] = [];

    start() {
        this._objects = [];
        for (let i = 0; i < this.maxParticles; i++) {
            const p = this.particlePrefab.clone(this.object);
            p.resetPositionRotation();
            p.scaleLocal([0, 0, 0]);
            //  wlUtils.setActive(p, false);

            this.initParticle(p, i);

            this._objects.push(p);
        }
        // this._objects = this.engine.scene.addObjects(
        //     this.maxParticles,
        //     null,
        //     this.maxParticles
        // );

        // for (let i = 0; i < this.maxParticles; ++i) {
        //     this._velocities.push([
        //         Math.random() / 4 - 0.125,
        //         -Math.random() - 0.2,
        //         Math.random() / 4 - 0.125,
        //     ]);
        //     let obj = this._objects[i];
        //     obj.name = 'particle' + this.count.toString();
        //     let mesh = obj.addComponent(MeshComponent);

        //     /* Most efficient way to hide the mesh */
        //     obj.scaleLocal([0, 0, 0]);
        // }

        // /* Time to spawn particles */
        for (let i = 0; i < this.maxParticles; ++i) {
            this.spawn();
        }
    }

    /**
     * Override this function to initialize the particle object.
     * This is called for every particle when initialzied
     * @param particle a particle object to initialize
     * @param index
     */
    initParticle(particle: Object3D, index: number) {}

    /**
     * Override this function to update a particle object.
     * This is called for every particle when initialzied
     * @param particle a particle object to initialize
     * @param index
     */
    updateParticle(particle: Object3D, index: number, dt: number) {}

    onParticleSpawn(particle: Object3D, index: number) {}

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

    /** Spawn a particle */
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

export class DeathParticles extends ParticlesBase {
    static TypeName = 'death-particles';
    static InheritProperties = true;

    @property.float(15)
    initialSpeed!: number;

    private _velocities: vec3[] = [];

    private _speeds: number[] = [];

    private _direction: vec3[] = [];
    private _scales: number[] = [];

    start(): void {
        super.start();
    }

    override initParticle(particle: Object3D, index: number): void {
        this._speeds[index] = Math.random() * this.initialSpeed + 0.5;
        this._direction[index] = vec3.normalize(vec3.create(), [
            Math.random() * 2 - 1,
            Math.random() * 2 - 1,
            0, // not moving in Z direction
        ]);
        this._scales[index] = this.particleScale;
    }
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
