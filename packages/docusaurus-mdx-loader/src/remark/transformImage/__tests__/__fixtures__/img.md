![img](https://example.com/img.png)

![](./static/img.png)

![img](static/img.png)

in paragraph ![img](static/img.png)

![img from second static folder](/img2.png)

![img from second static folder](./static2/img2.png)

![img with URL encoded chars](./static2/img2%20copy.png)

![img](./static/img.png 'Title') ![img](/img.png)

![img with "quotes"](./static/img.png ''Quoted' title')

![site alias](@site/static/img.png)

![img with hash](/img.png#light) ![img with hash](/img.png#dark)

![img with query](/img.png?w=10) ![img with query](/img.png?w=10&h=10)

![img with both](/img.png?w=10&h=10#light)

## Heading

```md
![img](./static/img.png)
```

## Images with spaces

![img](</img with spaces.png>)

![img](<@site/static/img with spaces.png>)

![img](</img with one encoded%2520space.png>)

![img](<@site/static/img with one encoded%2520space.png>)
