docker build -t barnuri/openapi-toolkit .
if ($LASTEXITCODE -ne 0) {
    throw "docker build failed"
}
docker tag barnuri/openapi-toolkit barnuri/openapi-toolkit
if ($LASTEXITCODE -ne 0) {
    throw "docker tag failed"
}
docker push barnuri/openapi-toolkit
if ($LASTEXITCODE -ne 0) {
    throw "docker push failed"
}
