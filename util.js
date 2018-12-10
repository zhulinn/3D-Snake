function toIndex(x) {
    x -= 0.05;
    x /= 0.1;

    x += 20
    return Math.round(x);
}
function toCoord(i) {
    i -= 20;
    i *= 0.1;
    i += 0.05;
    return Math.round(i * 100) / 100;
}
function getCube(w, l, d, material, position) {
    var geometry = new THREE.BoxGeometry(w, l, d);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = position.x;
    mesh.position.y = position.y;
    mesh.position.z = position.z;
    return mesh;
}