function getPost(position) {
    const postDate = document.getElementById("post-date" + position);
    const postTitle = document.getElementById("post-title" + position)
    const postContent = document.getElementById("post-content" + position)

    const url = 'https://b5y9tmytqj.execute-api.us-west-2.amazonaws.com/prod/posts/query?listnumber=' + position;
    const postUrl = 'https://b5y9tmytqj.execute-api.us-west-2.amazonaws.com/prod/posts?post=';

    fetch(url)
    .then((resp) => resp.json())
    .then(function(data) {

        postDate.innerHTML = "On " + data.Time;
        postContent.innerHTML = data.Content;
        postTitle.innerHTML = "<a href=" + postUrl + data.PostID + ">" +  data.Title + "</a>";

    })

    .catch(function(error){

        console.log(JSON.stringify(error));
    });

}