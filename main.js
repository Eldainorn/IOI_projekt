/**
 * Matej Dolenc
 * 13.1.2018
 * IOI, FRI 2017/18
 *
 * Notes:
 * - koordinate (X, Y, Z)  X in Z horizontalno, Y vertikalno
 */

var map = [ // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 1
           [1, 0, 1, 1, 1, 1, 1, 1, 0, 1,], // 2
           [1, 0, 1, 0, 0, 0, 0, 1, 0, 1,], // 3
           [1, 0, 1, 0, 1, 1, 0, 2, 0, 1,], // 4
           [1, 0, 1, 0, 1, 1, 0, 2, 0, 1,], // 5
           [1, 0, 1, 0, 0, 0, 0, 1, 0, 1,], // 6
           [1, 0, 1, 1, 1, 1, 1, 1, 0, 1,], // 7
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           ], mapW = map.length, mapH = map[0].length;

//konstante
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 250,
	WALLHEIGHT = UNITSIZE / 3,
	MOVESPEED = 100,
	LOOKSPEED = 0.075;

//globalne sprem.
var t = THREE, scene, cam, renderer, controls, clock;
var runAnim = true//, mouse = { x: 0, y: 0 }
var controlsKeys = [36, 38, 39, 40, 65, 68, 83, 87];
var keyPressed = [];

//popup control
var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster;
var popupClicked = false;

//opisi slik
var desc1, desc2, desc3, desc4, desc5, desc6, desc7, desc8, desc9, desc10,
	desc11, desc12, desc13, desc14, desc15, desc16, desc17, desc18, desc19,
	desc20;
var authorTech1, authorTech2, authorTech3, authorTech4, authorTech5, authorTech6, authorTech7,
	authorTech8, authorTech9, authorTech10, authorTech11, authorTech12, authorTech13, authorTech14,
	authorTech15, authorTech16, authorTech17, authorTech18, authorTech19, authorTech20;

//reference za raycaster ipd.
var works = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13",
			 "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]; 

//prompt control
var promptVisible = false;			

//ready document
$(document).ready(function() {	
	/*init();
	//setInterval(drawRadar, 1000);
	animate();
*/
	$('body').append('<div id="loading">Start ?</div>');
	$('#loading').css({width: WIDTH, height: HEIGHT}).one('click', function() {
		$("#loading").remove();
		init();
		//setInterval(drawRadar, 1000);
		animate();
	});
});

//init funkcija -> vzpostavi glavnino galerije
function init() {
	clock = new t.Clock(); // Used in render() for controls.update()
	scene = new t.Scene(); // Holds all objects in the canvas
	scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); // color, density
	
	// Set up camera
	cam = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
	cam.position.y =  UNITSIZE * .2;

	//zacetna postavitev kamere -> cam.position.x in cam.position.z
	cam.position.x -= 150;
	cam.position.z += 500;

	scene.add(cam);
	
	//premikanje kamere z misko in smernimi tipkami ali WASD
	controls = new t.FirstPersonControls(cam);
	controls.movementSpeed = MOVESPEED;
	controls.lookSpeed = 0;//LOOKSPEED; //onDocumentMouseMove() sets the speed! Check there!
	controls.lookVertical = false; // Temporary solution; play on flat surfaces only --> TODO how to fix this hmmm... ???
	controls.noFly = true;

	//zai&#269;etna smer kontrol -> kamere
	controls.lon = -90;

	//postavitev galerije
	setupScene();

	//WebGL renderer
	renderer = new t.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	//canvas
	renderer.domElement.style.backgroundColor = '#D6F1FF'; 
	document.body.appendChild(renderer.domElement);

	//raycaster
	raycaster = new THREE.Raycaster();
	
	//mouse actions
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('click', onDocumentMouseClick, false);
}

//animate funkcija
function animate() {
	if (runAnim) {
		requestAnimationFrame(animate);
	}
	render();
}

//render funkcija -> prikaz
function render() {
	var delta = clock.getDelta();
	var aispeed = delta * MOVESPEED;
	controls.update(delta); // Move camera


	//-------------------------//
	// Prikaz prompta za sliko //
	//-------------------------//
	raycaster.setFromCamera( mouse, cam );
	var intersects = raycaster.intersectObjects( scene.children );

	if (!promptVisible && intersects.length > 0 && intersects[0].distance < 150 && works.indexOf(intersects[0].object.geometry.name) >= 0 && !popupClicked){
				$('body').append('<div id="prompt" style="display:inline; text-align: center;">' + 
									'&nbsp;Click!&nbsp;' +
								'</div>');
				promptVisible = true;
	}
	else if (intersects.length > 0 && (works.indexOf(intersects[0].object.geometry.name) < 0) || (intersects.length > 0 && intersects[0].distance > 150)){
		$('#prompt').remove();
		promptVisible = false;
	}

	renderer.render(scene, cam); // Repaint
}

//postavitev galerije
function setupScene() {
	var UNITSIZE = 250, units = mapW; //length

	//-------//
	// Floor //
	//-------//
	var floorTexture = new THREE.ImageUtils.loadTexture('images/floor2.jpg');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(50, 50);
	var floorMaterial = new THREE.MeshBasicMaterial({map: floorTexture});
	var floor = new THREE.Mesh( new THREE.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE), floorMaterial );
	scene.add(floor);

	//-----//
	// Zid //
	//-----//
	var cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT*2, UNITSIZE); //WALLHEIGHT = 250/3 = 83.3
	var materials = [
	                 new t.MeshBasicMaterial({/*color: 0x00CCAA,*/map: t.ImageUtils.loadTexture('images/wall-1.jpg')}),
	                 new t.MeshLambertMaterial({/*color: 0xC5EDA0,*/map: t.ImageUtils.loadTexture('images/wall-1.jpg')}),
	                 new t.MeshLambertMaterial({color: 0xFBEBCD}),
	                 ];
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			if (map[i][j] == 1) {
				var wall = new t.Mesh(cube, materials[map[i][j]-1]);
				wall.position.x = (i - units/2) * UNITSIZE; //units = mapWidth = 10 = map.length, unitSize=250
				//console.log((i - units/2) * UNITSIZE);
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE;
				scene.add(wall);
			}

			else if (map[i][j] == 2) { //back wall for "pretty" look
				var cube2 = new t.CubeGeometry(UNITSIZE,WALLHEIGHT*2,10); //WALLHEIGHT = 250/3 = 83.3
				var wall = new t.Mesh(cube2, materials[map[i][j]-2]);
				wall.position.x = (i - units/2) * UNITSIZE; //units = mapWidth = 10 = map.length, unitSize=250
				//console.log((i - units/2) * UNITSIZE);
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE+UNITSIZE/2;
				scene.add(wall);
			}
		}
	}

	//-------//
	// Works //
	//-------//
	//Front wall
	var placeholder = new t.CubeGeometry(1,80,120);
	placeholder.name = "2";
	var image = new THREE.Mesh(placeholder, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/2.jpg')}))
	image.position.x = 375;
	image.position.y = 65;
	image.position.z = 0;
	scene.add(image);

	desc1 = "Tu gre za prvinske elemente, ki jim avtorica dodeljuje medsebojne odnose " +
			"na poseben na&#269;in.";
	authorTech1 = "Anita Indihar Dimic, Jedkanica 1, suha igla";

	var placeholder2 = new t.CubeGeometry(1,80,120);
	placeholder2.name = "1";
	var image2 = new THREE.Mesh(placeholder2, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/1.jpg')}))
	image2.position.x = 375; //"not ven"
	image2.position.y = 65; //visina
	image2.position.z = UNITSIZE; //levo desno
	scene.add(image2);

	desc2 = "Tiho&#382;itje z motivom predmeta kadilnice je upodobljeno na realisti&#269;en na&#269;in. "+
			"V tem delu je tudi prisotno postopno jedkanje.";
	authorTech2 = "Peter Stegu, Kadilnica, jedkanica";

	var placeholder3 = new t.CubeGeometry(1,80,120);
	placeholder3.name = "3";
	var image3 = new THREE.Mesh(placeholder3, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/3.jpg')}))
	image3.position.x = 375;
	image3.position.y = 65;
	image3.position.z = -UNITSIZE;
	scene.add(image3);

	desc3 = "Tiho&#382;itje z motivom bakrene posode je upodobljeno na realisti&#269;en na&#269;in.";
	authorTech3 = "Peter Stegu, Tiho&#382;itje 1, jedkanica";

	var placeholder4 = new t.CubeGeometry(1,80,120);
	placeholder4.name = "4";
	var image4 = new THREE.Mesh(placeholder4, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/4.jpg')}))
	image4.position.x = 375;
	image4.position.y = 65;
	image4.position.z = -2*UNITSIZE;
	scene.add(image4);

	desc4 = "Tiho&#382;itje z motivom sadja je upodobljeno na realisti&#269;en na&#269;in. "+
			"Po tovrstnih tehnikah je med drugimi znan tudi dober grafik "+
			"Albreht Duerer.";
	authorTech4 = "Peter Stegu, Tiho&#382;itje 2, jedkanica";

	//Left wall
	var placeholder5 = new t.CubeGeometry(1,80,120);
	placeholder5.name = "5";
	var image5 = new THREE.Mesh(placeholder5, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/5.jpg')}))
	image5.position.x = 250;
	image5.position.y = 65;
	image5.position.z = 375;
	image5.rotation.y = Math.PI / 2;
	scene.add(image5);

	desc5 = "Nami&#353;ljena krajina je upodobljena z odvzemanjem in prekrivanjem svetlo-temnega.";
	authorTech5 = "Andrej Praznik, Neko mesto nekje, suha igla";

	// var placeholder6 = new t.CubeGeometry(1,80,30);
	// var image6 = new THREE.Mesh(placeholder6, new t.MeshLambertMaterial({color: 0x000000} /*{map: t.ImageUtils.loadTexture('images/monaLisa.jpg')}*/))
	// image6.position.x = 250-UNITSIZE;
	// image6.position.y = 45;
	// image6.position.z = 375;
	// image6.rotation.y = Math.PI / 2;
	// scene.add(image6);

	// var placeholder7 = new t.CubeGeometry(1,80,30);
	// var image7 = new THREE.Mesh(placeholder7, new t.MeshLambertMaterial({color: 0x000000} /*{map: t.ImageUtils.loadTexture('images/monaLisa.jpg')}*/))
	// image7.position.x = 250-2*UNITSIZE;
	// image7.position.y = 45;
	// image7.position.z = 375;
	// image7.rotation.y = Math.PI / 2;
	// scene.add(image7);

	var placeholder8 = new t.CubeGeometry(1,90,60);
	placeholder8.name = "6";
	var image8 = new THREE.Mesh(placeholder8, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/6.jpg')}))
	image8.position.x = 250-3*UNITSIZE;
	image8.position.y = 65;
	image8.position.z = 375;
	image8.rotation.y = Math.PI / 2;
	scene.add(image8);

	desc6 = "Hmeljsko polje se razprostira v horizont.";
	authorTech6 = "Eva &#352;uster, Hmelj, reservage";

	//Back wall
	var placeholder9 = new t.CubeGeometry(1,90,60);
	placeholder9.name = "7";
	var image9 = new THREE.Mesh(placeholder9, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/7.jpg')}))
	image9.position.x = -625;
	image9.position.y = 65;
	image9.position.z = 250;
	scene.add(image9);

	desc7 = "Tu gre za prvinske elemente, ki jim avtorica dodeljuje medsebojne odnose na poseben na&#269;in.";
	authorTech7 = "Anita Indihar Dimic, Suha igla 1, suha igla";

	var placeholder10 = new t.CubeGeometry(1,90,60);
	placeholder10.name = "8";
	var image10 = new THREE.Mesh(placeholder10, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/8.jpg')}))
	image10.position.x = -625;
	image10.position.y = 65;
	image10.position.z = 250-UNITSIZE;
	scene.add(image10);

	desc8 = "Grafi&#269;no delo po vzoru kiparske skulpture.";
	authorTech8 = "Petja Novak, Suha igla 1, suha igla";

	var placeholder11 = new t.CubeGeometry(1,80,120);
	placeholder11.name = "9";
	var image11 = new THREE.Mesh(placeholder11, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/9.jpg')}))
	image11.position.x = -625;
	image11.position.y = 65;
	image11.position.z = 250-2*UNITSIZE;
	scene.add(image11);

	desc9 = "Tiho&#382;itje z motivom predmetov in sadja je upodobljeno na realisti&#269;en na&#269;in.";
	authorTech9 = "Peter Stegu, Tiho&#382;itje 3, jedkanica";

	var placeholder12 = new t.CubeGeometry(1,90,60);
	placeholder12.name = "10";
	var image12 = new THREE.Mesh(placeholder12, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/10.jpg')}))
	image12.position.x = -625;
	image12.position.y = 65;
	image12.position.z = 250-3*UNITSIZE;
	scene.add(image12);

	desc10 = "Gre za kubisti&#269;ni portret variacije na Picassa.";
	authorTech10 = "Maria Karnar Lemesheva, Variacija na Picassa, lesorez";

	//Right wall
	var placeholder13 = new t.CubeGeometry(1,80,120);
	placeholder13.name = "11";
	var image13 = new THREE.Mesh(placeholder13, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/11.jpg')}))
	image13.position.x = 250;
	image13.position.y = 65;
	image13.position.z = -625;
	image13.rotation.y = Math.PI / 2;
	scene.add(image13);

	desc11 = "Gre za kri&#269;e&#269;o podobo bika po vzoru slikarskega mojstra Picassa.";
	authorTech11 = "Betina Habjan&#269;i&#269;, Bik po Picassu, suha igla";

	var placeholder14 = new t.CubeGeometry(1,90,60);
	placeholder14.name = "12";
	var image14 = new THREE.Mesh(placeholder14, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/23.jpg')}))
	image14.position.x = 250-UNITSIZE;
	image14.position.y = 65;
	image14.position.z = -625;
	image14.rotation.y = Math.PI / 2;
	scene.add(image14);

	desc12= "Grafi&#269;na reprodukcija Picassovih Avignonskih gospodi&#269;en.";
	authorTech12 = "Zala Bo&#382;i&#269;, Po Picassu, barvna jedkanica in akvatinta";

	var placeholder15 = new t.CubeGeometry(1,80,120);
	placeholder15.name = "13";
	var image15 = new THREE.Mesh(placeholder15, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/13.jpg')}))
	image15.position.x = 250-2*UNITSIZE;
	image15.position.y = 65;
	image15.position.z = -625;
	image15.rotation.y = Math.PI / 2;
	scene.add(image15);

	desc13 = "Parkirni prostor pred akademijo za likovno umetnost, prikazan na "+
				"poseben na&#269;in, ki nakazuje prostor in ga obenem tudi ignorira.";
	authorTech13 = "Natalija Juhan, Parkirni prostor, jedkanica";

	var placeholder16 = new t.BoxGeometry(1,80,120);
	placeholder16.name = "14";
	var image16 = new THREE.Mesh(placeholder16, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/14.jpg')}))
	image16.position.x = 250-3*UNITSIZE;
	image16.position.y = 65;
	image16.position.z = -625;
	image16.rotation.y = Math.PI / 2;
	scene.add(image16);

	desc14 = "Tu gre za prvinske elemente, ki jim avtorica dodeljuje medsebojne odnose "+
			"na poseben na&#269;in. Dodatno je podkrepljeno z dolo&#269;enimi barvami.";
	authorTech14 = "Anita Indihar Dimic, Suha igla in barve 1, suha igla in barve";

	//inner circle works
	var placeholder17 = new t.CubeGeometry(1,80,120);
	placeholder17.name = "15";
	var image17 = new THREE.Mesh(placeholder17, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/15.jpg')}))
	image17.position.x = 375- UNITSIZE;
	image17.position.y = 65;
	image17.position.z = 0;
	scene.add(image17);

	desc15 = "Prikazana je krajina, ki na realisti&#269;en na&#269;in ponazarja horizont.";
	authorTech15 = "Eva Novak, Pokrajina 3, barvni lesorez";

	var placeholder18 = new t.CubeGeometry(1,80,120);
	placeholder18.name = "16";
	var image18 = new THREE.Mesh(placeholder18, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/16.jpg')}))
	image18.position.x = 375 - UNITSIZE;
	image18.position.y = 65;
	image18.position.z = -UNITSIZE;
	scene.add(image18);

	desc16 = "Krajina, ki s pridihom realizma ponazarja nagrabljene kupe sena "+
				"v poletnem ve&#269;eru.";
	authorTech16 = "Eva Novak, Pokrajina 2, barvni lesorez";

	var placeholder19 = new t.CubeGeometry(1,80,120);
	placeholder19.name = "17";
	var image19 = new THREE.Mesh(placeholder19, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/17.jpg')}))
	image19.position.x = 250-UNITSIZE;
	image19.position.y = 65;
	image19.position.z = -625+ UNITSIZE;
	image19.rotation.y = Math.PI / 2;
	scene.add(image19);

	desc17 = "Prikaz vodnega kanala je prostorsko nakazan z odpiranjem prostora in ponovnim odvzemom "+
			"dolo&#269;enih detajlov na sliki. "+
			"Avtorica tudi dodaja barve, ki sovpadajo z raznolikim videzom Benetk.";
	authorTech17 = "Natalija Juhant, Markovi vzdihljaji, barvni lesorez";

	var placeholder20 = new t.CubeGeometry(1,80,120);
	placeholder20.name = "18";
	var image20 = new THREE.Mesh(placeholder20, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/18.jpg')}))
	image20.position.x = 250-2*UNITSIZE;
	image20.position.y = 65;
	image20.position.z = -625+ UNITSIZE;
	image20.rotation.y = Math.PI / 2;
	scene.add(image20);

	desc18 = "Prikaz vodnega kanala in Markovega trga v Benetkah je prostorsko nakazan z odpiranjem prostora in ponovnim odvzemom "+
			"dolo&#269;enih detajlov na sliki. Avtorica tudi dodaja barve, ki sovpadajo z raznolikim videzom Benetk.";
	authorTech18 = "Natalija Juhant, Markov trg, barvni lesorez";

	var placeholder21 = new t.CubeGeometry(1,90,60);
	placeholder21.name = "19";
	var image21 = new THREE.Mesh(placeholder21, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/19.jpg')}))
	image21.position.x = -625 + UNITSIZE;
	image21.position.y = 65;
	image21.position.z = 250-UNITSIZE;
	scene.add(image21);

	desc19 = "Pri tej tehniki avtor zdru&#382;uje razli&#269;ne matrice in nam na ta na&#269;in prika&#382;e "+
			"kon&#269;ni rezultat barvne figure z ozadjem.";
	authorTech19 = "Peter Stegu, Po Picassu, barvni lesorez";

	var placeholder22 = new t.CubeGeometry(1,90,60);
	placeholder22.name = "21";
	var image22 = new THREE.Mesh(placeholder22, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/works/21.jpg')}))
	image22.position.x = -625 + UNITSIZE;
	image22.position.y = 65;
	image22.position.z = 250-2*UNITSIZE;
	scene.add(image22);

	desc20 = "Pri tej tehniki avtor zdru&#382;uje razli&#269;ne matrice in nam na ta na&#269;in prika&#382;e "+
				"kon&#269;ni rezultat barvnega tiho&#382;itja.";
	authorTech20 = "Neznan avtor, Tiho&#382;itje, neznana tehnika";

	//---------//
	// Ceiling //
	//---------//
	var ceil = new THREE.CubeGeometry(6*UNITSIZE,10, 6*UNITSIZE)
	var ceilingTexture = new THREE.ImageUtils.loadTexture('images/ceiling2.jpg');
	ceilingTexture.wrapS = ceilingTexture.wrapT = THREE.RepeatWrapping;
	ceilingTexture.repeat.set(40, 40);
	var ceilingMaterial = new THREE.MeshBasicMaterial({map: ceilingTexture});
	var ceiling = new THREE.Mesh(ceil, ceilingMaterial);
	ceiling.position.y = 130;
	ceiling.position.x = 50;
	scene.add(ceiling);

	//----------------//
	// Rdeca preproga //
	//----------------//
	//short ones
	var carpetGeo1 = new THREE.CubeGeometry(2*UNITSIZE+40, 1, UNITSIZE-40);
	var carpetTexture = new THREE.ImageUtils.loadTexture('images/redCarpet.jpg');
	carpetTexture.wrapS = carpetTexture.wrapT = THREE.RepeatWrapping;
	carpetTexture.repeat.set(10, 10);

	var carpetMaterial = new THREE.MeshBasicMaterial({map: carpetTexture});
	var carpet1 = new THREE.Mesh(carpetGeo1, carpetMaterial);
	carpet1.position.y = 5;
	carpet1.position.x = -1/2*UNITSIZE;
	carpet1.position.z =  250;
	scene.add(carpet1);

	var carpet2 = new THREE.Mesh(carpetGeo1, carpetMaterial);
	carpet2.position.y = 5;
	carpet2.position.x = -1/2*UNITSIZE;
	carpet2.position.z = -3*UNITSIZE + 250;
	scene.add(carpet2);

	//long ones
	var carpetGeo2 = new THREE.CubeGeometry(UNITSIZE-40, 1, 4*UNITSIZE-40);
	var carpet3 = new THREE.Mesh(carpetGeo2, carpetMaterial);
	carpet3.position.y = 5;
	carpet3.position.x = -UNITSIZE + 2*UNITSIZE;
	carpet3.position.z = -250 - 3/2*UNITSIZE + 2*UNITSIZE;
	scene.add(carpet3);

	var carpet4 = new THREE.Mesh(carpetGeo2, carpetMaterial);
	carpet4.position.y = 5;
	carpet4.position.x = -UNITSIZE + 2*UNITSIZE - 3*UNITSIZE;
	carpet4.position.z = -250 - 3/2*UNITSIZE + 2*UNITSIZE;
	scene.add(carpet4);

	// osvetljava 
	var directionalLight1 = new t.DirectionalLight(0xF7EFBE, 0.7);
	directionalLight1.position.set(0.5, 1, 0.5);
	scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight(0xF7EFBE, 0.5);
	directionalLight2.position.set(-0.5, -1, -0.5);
	scene.add( directionalLight2 );

	//ambient light (light those models up)
	var ambLight = new THREE.AmbientLight(0xffffff);
    scene.add(ambLight);

    //--------//
	// Modeli //
	//--------//

	//Pillar
	//-------
	var objectLoader = new THREE.ObjectLoader();	
	objectLoader.load("models/pillar/textured-pillar.json", function ( obj ) {
		obj.position.y = 5;
		obj.position.z = 380;
		obj.position.x = -3/2*UNITSIZE+20;

		obj.scale.y = 12;
		obj.scale.x = 8;
		obj.scale.z = 8;

		obj.materials = new t.MeshBasicMaterial({color: 0xFBEBCD});

		//var pillar = new t.Mesh(obj, new t.MeshLambertMaterial({color: 0xFBEBCD}));

		scene.add(obj);
	} );

	var objectLoader2 = new THREE.ObjectLoader();
	objectLoader2.load("models/pillar/textured-pillar.json", function ( obj2 ) {
		obj2.position.y = 5;
		obj2.position.z = 380;
		obj2.position.x = -3/2*UNITSIZE + 2*UNITSIZE-20;

		obj2.scale.y = 12;
		obj2.scale.x = 8;
		obj2.scale.z = 8;

		obj2.materials = new t.MeshPhongMaterial({color: 0xFBEBCD});

		//var pillar = new t.Mesh(obj, new t.MeshLambertMaterial({color: 0xFBEBCD}));

		scene.add(obj2);
	} );

	//Fence
	//------
	var wallLength = 2*UNITSIZE + 40;
	var fenceLength = wallLength / 4;
	
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    //inner fence, front
	    for (var i = 0; i < 5; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 -UNITSIZE+44;
			tempNew.position.x = -3/2*UNITSIZE+35 + offset;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});

	//inner fence, front
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 5; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 -UNITSIZE+41 - 2*UNITSIZE-35;
			tempNew.position.x = -3/2*UNITSIZE+35 + offset;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
			                             if ( child instanceof THREE.Mesh ) {
			                                  child.material.color.setHex(0x252626);
			                                 }
			                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});

	//inner fence, left
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 5; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 -UNITSIZE+41 - 2*UNITSIZE-35 + 2*UNITSIZE -15 - offset;
			tempNew.position.x = -3/2*UNITSIZE+35-54;
			tempNew.rotation.y = 90 * Math.PI/180;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
			                             if ( child instanceof THREE.Mesh ) {
			                                  child.material.color.setHex(0x252626);
			                                 }
			                             } );

			scene.add(tempNew)
			offset += 108; //108
	    }
	});

	//inner fence, right
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 5; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 -UNITSIZE+41 - 2*UNITSIZE-35 + 2*UNITSIZE -15 - offset;
			tempNew.position.x = -3/2*UNITSIZE+35-54+2*UNITSIZE+38;
			tempNew.rotation.y = 90 * Math.PI/180;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			offset += 108; //108
	    }
	});


	//outer fence back
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 9; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 - UNITSIZE + 44 - 3*UNITSIZE;
			tempNew.position.x = -3/2*UNITSIZE+25  - UNITSIZE+ 30 + offset +15;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});

	//outer fence front1
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 2; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 - UNITSIZE + 44 - 3*UNITSIZE + 4*UNITSIZE-38;
			tempNew.position.x = -3/2*UNITSIZE+25  - UNITSIZE+ 30 + offset +15;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});

	//outer fence front2
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 2; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 - UNITSIZE + 44 - 3*UNITSIZE + 4*UNITSIZE-38;
			tempNew.position.x = -3/2*UNITSIZE+25  - UNITSIZE+ 30 + offset +15+750;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});


	//outer fence left
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 9; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 - UNITSIZE + 44 - 3*UNITSIZE + 1/2*UNITSIZE -75 + offset;
			tempNew.position.x = -3/2*UNITSIZE+25  - UNITSIZE -6;

			tempNew.rotation.y = 90 * Math.PI/180;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});

	//outer fence right
	objectLoader.load("models/chainFence/chain-fence.json", function (obj) {
		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 9; i++) {
	        var tempNew = serverObject.clone()

	        tempNew.position.y = 5;
			tempNew.position.z = 350 - UNITSIZE + 44 - 3*UNITSIZE + 1/2*UNITSIZE -75 + offset;
			tempNew.position.x = -3/2*UNITSIZE+25  - UNITSIZE -6 + 4*UNITSIZE-38;

			tempNew.rotation.y = 90 * Math.PI/180;

			tempNew.scale.y = 5;
			tempNew.scale.x = 4;
			tempNew.scale.z = 4;

			tempNew.traverse( function ( child ) {
                             if ( child instanceof THREE.Mesh ) {
                                  child.material.color.setHex(0x252626);
                                 }
                             } );

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 108;
	    }
	});



	//---------------//
	// Oglasna deska //
	//---------------//
	var board = new t.CubeGeometry(1,60,180);
	var boardMesh = new THREE.Mesh(board, new t.MeshBasicMaterial({map: t.ImageUtils.loadTexture('images/razstava2.png')}));
	boardMesh.position.x = 250-1.5*UNITSIZE;
	boardMesh.position.y = 65;
	boardMesh.position.z = 125;
	boardMesh.rotation.y = Math.PI / 2;
	scene.add(boardMesh);


	//------//
	// Lamp //
	//------//
/*	var objectLoader = new THREE.ObjectLoader();	
	objectLoader.load("models/lamp/lamp.json", function ( obj ) {

		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 3; i++) {
	        var tempNew = serverObject.clone()

			tempNew.position.y = WALLHEIGHT*2+-45;
			tempNew.position.z = UNITSIZE;
			tempNew.position.x = -2*UNITSIZE+ offset;

			tempNew.scale.y = 0.5;
			tempNew.scale.x = 0.5;
			tempNew.scale.z = 0.5;

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 3/2*UNITSIZE;
	    }
	} );

	objectLoader.load("models/lamp/lamp.json", function ( obj ) {

		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 3; i++) {
	        var tempNew = serverObject.clone()

			tempNew.position.y = WALLHEIGHT*2-45;
			tempNew.position.z = UNITSIZE - 3*UNITSIZE;
			tempNew.position.x = -2*UNITSIZE+ offset;

			tempNew.scale.y = 0.5;
			tempNew.scale.x = 0.5;
			tempNew.scale.z = 0.5;

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 3/2*UNITSIZE;
	    }
	} );

	objectLoader.load("models/lamp/lamp.json", function ( obj ) {

		var offset = 0;
	    serverObject = obj;

	    for (var i = 0; i < 2; i++) {
	        var tempNew = serverObject.clone()

			tempNew.position.y = WALLHEIGHT*2-45;
			tempNew.position.z = UNITSIZE - 3/2*UNITSIZE;
			tempNew.position.x = -2*UNITSIZE+ offset;

			tempNew.scale.y = 0.5;
			tempNew.scale.x = 0.5;
			tempNew.scale.z = 0.5;

			scene.add(tempNew)
			//console.log(tempNew);
			offset += 3/2*UNITSIZE*2;
	    }
	} );*/

}

function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	console.log(map[x][z]);
	return {x: x, z: z};
}

//preveri kolizije 
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] == 1; // > 0;
}



//gledanje s kamero levo, desno, ...
function onDocumentMouseMove(e) {
	e.preventDefault();
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;

	//start moving camera after me move mouse for the first time
	controls.lookSpeed = 0.075;
}

//popup painting info after prompt shows and click
function onDocumentMouseClick(e){
	raycaster.setFromCamera( mouse, cam );
	var intersects = raycaster.intersectObjects( scene.children );
	console.log(cam.position.x + " " + cam.position.z);
	//-------------------//
	// POP UP FOR IMAGES //
	//-------------------//
	if (!popupClicked){
		//ali smo dovolj blizu slike da se nam odpre pop up ?
		if (intersects.length > 0 && intersects[0].distance < 150){

			if (intersects[0].object.geometry.name === "2"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/2.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' + authorTech1 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">' + desc1 +'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "1"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/1.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' + authorTech2 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">' + desc2 + '</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "3"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/3.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' + authorTech3 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc3 +'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "4"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/4.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech4 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc4+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "5"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/5.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech5 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc5+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "6"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" style="width: 400px;" src="images/works/6.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech6 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0">'+desc6+'</p>' +
										'</div>'+						
								'</div>');
				$('#prompt').remove();
				promptVisible = false;
				popupClicked = true;
				controls.activeLook = false;
				controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "7"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" src="images/works/7.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech7+'</p>'+
										'<br>' +
										'<p style="margin-top: 0">'+desc7+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "8"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" src="images/works/8.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech8 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0">'+desc8+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "9"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/9.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech9 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+ desc9+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "10"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" src="images/works/10.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech10 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0">'+desc10+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "11"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/11.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech11 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc11+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "12"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" src="images/works/23.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+authorTech12 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0">'+desc12+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "13"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/13.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech13 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc13+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "14"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/14.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech14 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc14+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "15"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/15.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech15 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc15+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "16"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/16.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech16 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc16+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "17"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/17.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech17 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc17+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "18"){
					//HORIZONTAL IMAGE
					$('body').append('<div id="popup" style="display:inline; text-align: center;">' + 
										'<img class="imageHorz" src="images/works/18.jpg">' +
											'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">' +authorTech18 +'</p>' +
											'<br>' +
											'<p style="margin-top: 0;">'+desc18+'</p>' +
									'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;							
					controls.movementSpeed = 0.0;	
			}

			else if (intersects[0].object.geometry.name === "19"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" style="width: 400px;" src="images/works/19.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech19 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0; width: 700px;">'+desc19+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}

			else if (intersects[0].object.geometry.name === "21"){
					//VERTICAL IMAGE 
				$('body').append('<div id="popup">' +
									'<div style="display:inline-block; min-width:2.2cm; height:3.8cm; align: center;vertical-align: middle; padding-top:20px; padding-left: 50px;"> ' +
									'<img class="imageVert" style="width: 400px;" src="images/works/21.jpg"></div>' +

									'<div class="textVert" style="display:inline-block;vertical-align: middle;">'+
										'<p style="font-size: 30px; margin-bottom: 0; font-family: arial;">'+ authorTech20 +'</p>'+
										'<br>' +
										'<p style="margin-top: 0; width: 700px;">'+desc20+'</p>' +
										'</div>'+						
								'</div>');
					$('#prompt').remove();
					promptVisible = false;
					popupClicked = true;
					controls.activeLook = false;
					controls.movementSpeed = 0.0;
			}
		}
	}
	else if (popupClicked){
		//hide popup after second click
		$('#popup').remove();
		popupClicked = false;
		controls.activeLook = true;
		controls.movementSpeed = 100.0;
	}

	/*console.log(controls.lat);

	if (cam.fov >= 60){
		cam.fov = 30;
		$('*').off('keyup keydown keypress');
		controls.lookVertical = true;
		//disable arrow keys and WASD ???
		controls.disableMove = true;

	}
	else if (cam.fov <= 59){
		controls.lat = 0; //resetiramo pogled naravnost, ko "odbli&#382;am"
		cam.fov = 60;
		controls.lookVertical = false;
		// enable movement keys
		controls.disableMove = false;

	}
  	cam.updateProjectionMatrix();*/
}

//resize
$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	ASPECT = WIDTH / HEIGHT;
	if (cam) {
		cam.aspect = ASPECT;
		cam.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(WIDTH, HEIGHT);
	}
});

// ce ni fokusa -> stop moving :V
$(window).focus(function() {
	if (controls) {
		controls.freeze = false;
		controls.activeLook = true;
		controls.movementSpeed = 100.0;
	}
});
$(window).blur(function() {
	if (controls){ 
		controls.freeze = true;
		controls.activeLook = false;
		controls.movementSpeed = 0.0;
	}
});
