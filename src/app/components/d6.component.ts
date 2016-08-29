import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, Renderer } from '@angular/core';
import { DieRollService } from '../other/dieroll.service';
import { TurnService } from '../other/turn.service';

const MS_TO_SPIN: number = 1500;
var nextId: number = 0;

class dieFaceCoords {
    x: number;
    y: number;
}

class d6FaceCoords {
    sideOne: dieFaceCoords;
    sideTwo: dieFaceCoords;
    sideThree: dieFaceCoords;
    sideFour: dieFaceCoords;
    sideFive: dieFaceCoords; 
    sideSix: dieFaceCoords;
}

@Component({
    moduleId: module.id,
    selector: 'dice-d6',
    templateUrl: 'd6.component.html',
    styleUrls: ['d6.component.css'],
})
export class D6Component implements OnInit, AfterViewInit {
    animating: boolean;
    result: number;
    isHeld: boolean;
    holdClass: string;
    holdDisabled: boolean;
    rollNum: number;
    
//  Give each die a unique id
    @Input() id:string = `dice-${nextId++}`;
    
//  For reference to canvas DOM element and Hold button
    @ViewChild('dieCanvas') dieCanvasRef: ElementRef;
    @ViewChild('holdBtn') holdButtonRef: ElementRef;
    
//  Properties related to three.js rendering of die
    private geometry: THREE.BoxGeometry;
    private die: THREE.Mesh;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private glRenderer: THREE.WebGLRenderer;
    private height: number;
    private width: number;
    private fov: number;
    private dieRot: number;
    private dieSize: number;
    private camDist: number;
    private camMinDist: number;
    private camMaxDist: number;
    private materials: THREE.MeshBasicMaterial[] = [];
    private dieFaces: d6FaceCoords;

    constructor(private ngRenderer: Renderer, private dieRollService: DieRollService,
                private turnService: TurnService) { 
        this.height = 100;
        this.width = 100;
        this.fov = 45;
        this.camDist = 600;
        this.camMinDist = 1;
        this.camMaxDist = 2000;
        this.dieRot = 0.25;
        this.dieSize = 256;
        this.animating = false;
        this.setMaterials();
        this.dieFaces = new d6FaceCoords();
        this.setFaceCoords();
        this.resetDie();
        this.disableHold(true);
    }

    //  Add the die-face images to the materials array
    private setMaterials() {
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-1.png'), color: 0xffffff }));
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-2.png'), color: 0xffffff }));
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-3.png'), color: 0xffffff }));
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-4.png'), color: 0xffffff }));
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-5.png'), color: 0xffffff }));
        this.materials.push(new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('../images/d6-6.png'), color: 0xffffff }));
    }

    //  Set the x,y rotation coordinates that will result in each face being on top
    private setFaceCoords() {
        this.dieFaces.sideOne = { 'x': 0, 'y': 270 * Math.PI/180 };
        this.dieFaces.sideTwo = { 'x': 0, 'y': 90 * Math.PI/180 };
        this.dieFaces.sideThree = { 'x': 90 * Math.PI/180, 'y': 0 };
        this.dieFaces.sideFour = { 'x': 270 * Math.PI/180, 'y': 0 };
        this.dieFaces.sideFive = { 'x': 0, 'y': 0 };
        this.dieFaces.sideSix = { 'x': 0, 'y': 180 * Math.PI/180 };
    }

    resetDie() {
        this.animating = false;
        this.result = 0;
        this.isHeld = false;
    }

    ngOnInit() {
    //  Initialize three.js objects and properties
        this.geometry = new THREE.BoxGeometry(this.dieSize, this.dieSize, this.dieSize);
        this.die = new THREE.Mesh(this.geometry, new THREE.MeshFaceMaterial(this.materials));
        this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.camMinDist, this.camMaxDist);
        this.scene = new THREE.Scene();
        //this.scene.background = new THREE.Color(0x228B22);
        this.glRenderer = new THREE.WebGLRenderer();
        this.die.rotation.x = this.dieFaces.sideSix.x;
        this.die.rotation.y = this.dieFaces.sideSix.y;
        this.camera.position.z = this.camDist;
        this.scene.add(this.die);
        this.glRenderer.setSize(this.width, this.height);

    //  Event subscriptions
        this.dieRollService.rollEvent.subscribe(
            data => {
                if (!this.isHeld) { 
                    this.animating = data;
                    this.rollDie(MS_TO_SPIN);
                }
            }
        );
        this.dieRollService.rollFinishedEvent.subscribe(
            data => {
                if (data === 3) this.disableHold(true);
            }
        );
        this.turnService.advanceRollEvent.subscribe(
            data => {
                this.rollNum = data;
                if (data === 1)
                    this.disableHold(true);
                else
                    this.disableHold(false);
            }
        );
        this.turnService.newTurnEvent.subscribe(
            data => {
                if (data) {
                    this.rollNum = 1;
                    this.disableHold(true);
                }
            }
        );
    }

    ngAfterViewInit() {
    //  Must wait until after the view is initialized to grab the reference to the canvas element,
    //  otherwise, the reference will be undefined and an exception will occur
        this.ngRenderer.invokeElementMethod(this.dieCanvasRef.nativeElement, 'appendChild', [this.glRenderer.domElement]);

    //  Must recursively animate the die cube for a short time to get the renderer to draw it on
    //  the canvas at all. 500ms is a safe delay for this.  TODO: See if there's a way around this
        this.animating = true;
        this.rollDie(500, 6, true);
    }

    rollDie(duration: number, result: number = 0, init = false) {
        //this.animating = true;
        if (result === 0) result = this.getRandomD6Result();
        this.result = result;
        //alert(result);
    //  Capture value of this, otherwise it gets lost in recursion
        let that = this;
        
    //  Animate rotating die on canvas until delay time expires, then render die to show result
        let render = function() {
            if (that.animating) requestAnimationFrame(render)
            if (!init) {
                that.die.rotation.x += that.dieRot;
                that.die.rotation.y += that.dieRot;
            }
            that.glRenderer.render(that.scene, that.camera);
            setTimeout(function(){
                that.setFaceUpCoords(result, that.die);
                that.glRenderer.render(that.scene, that.camera);
                that.animating = false;
            }, duration);
        }
        if (this.animating) render();
    }

    private getRandomD6Result(): number
    {
        let result: number = 0;
        result = Math.floor(Math.random() * 6) + 1;
        return result;
    }

    //  Set x,y coordinates for the side of the die to be rendered facing up
    private setFaceUpCoords(faceNum: number, die: THREE.Mesh) {
        switch(faceNum) {
            case 1:
                die.rotation.x = this.dieFaces.sideOne.x;
                die.rotation.y = this.dieFaces.sideOne.y;
                break;
            case 2:
                die.rotation.x = this.dieFaces.sideTwo.x;
                die.rotation.y = this.dieFaces.sideTwo.y;
                break;
            case 3:
                die.rotation.x = this.dieFaces.sideThree.x;
                die.rotation.y = this.dieFaces.sideThree.y;
                break;
            case 4:
                die.rotation.x = this.dieFaces.sideFour.x;
                die.rotation.y = this.dieFaces.sideFour.y;
                break;
            case 5:
                die.rotation.x = this.dieFaces.sideFive.x;
                die.rotation.y = this.dieFaces.sideFive.y;
                break;
            case 6:
                die.rotation.x = this.dieFaces.sideSix.x;
                die.rotation.y = this.dieFaces.sideSix.y;
                break;
        }
    }

    disableHold(disable: boolean) {
        if (disable) {
            this.isHeld = false;
            this.holdDisabled = true;
            this.holdClass = 'holdDisabled';
        } else {
            this.holdDisabled = false;
            this.holdClass = this.isHeld ? 'held' : 'not-held';
        }
    }

    toggleHold() {
        this.isHeld = !this.isHeld;
        this.holdClass = this.isHeld ? 'held' : 'not-held';      
    }
}
