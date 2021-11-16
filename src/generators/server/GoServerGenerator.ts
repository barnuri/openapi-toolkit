import { writeFileSync } from 'fs';
import { ApiPath } from '../../models/ApiPath';
import { join } from 'path';
import { capitalize, makeDirIfNotExist } from '../../helpers';
import { GoGenerator } from '../GoGenerator';

export class GoServerGenerator extends GoGenerator {
    mainExportFile = join(this.options.output, 'main.go');
    generateClient() {
        const mod = `
module ${this.options.namepsace}

go 1.17

require github.com/labstack/echo/v4 v4.2.0

require (
	github.com/KyleBanks/depth v1.2.1 // indirect
	github.com/PuerkitoBio/purell v1.1.1 // indirect
	github.com/PuerkitoBio/urlesc v0.0.0-20170810143723-de5bf2ad4578 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.0-20190314233015-f79a8a8ca69d // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible // indirect
	github.com/ghodss/yaml v1.0.0 // indirect
	github.com/go-openapi/jsonpointer v0.19.5 // indirect
	github.com/go-openapi/jsonreference v0.19.5 // indirect
	github.com/go-openapi/spec v0.20.3 // indirect
	github.com/go-openapi/swag v0.19.14 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/labstack/gommon v0.3.0 // indirect
	github.com/mailru/easyjson v0.7.6 // indirect
	github.com/mattn/go-colorable v0.1.7 // indirect
	github.com/mattn/go-isatty v0.0.12 // indirect
	github.com/russross/blackfriday/v2 v2.0.1 // indirect
	github.com/shurcooL/sanitized_anchor_name v1.0.0 // indirect
	github.com/swaggo/echo-swagger v1.1.4 // indirect
	github.com/swaggo/files v0.0.0-20190704085106-630677cd5c14 // indirect
	github.com/swaggo/swag v1.7.4 // indirect
	github.com/urfave/cli/v2 v2.3.0 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasttemplate v1.2.1 // indirect
	golang.org/x/crypto v0.0.0-20200820211705-5c72a883971a // indirect
	golang.org/x/net v0.0.0-20210119194325-5f4716e94777 // indirect
	golang.org/x/sys v0.0.0-20210119212857-b64e53b001e4 // indirect
	golang.org/x/text v0.3.5 // indirect
	golang.org/x/time v0.0.0-20201208040808-7e3f01d25324 // indirect
	golang.org/x/tools v0.1.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)
`;
        writeFileSync(this.options.output + '/go.mod', mod);
        const sum = `
github.com/BurntSushi/toml v0.3.1/go.mod h1:xHWCNGjB5oqiDr8zfno3MHue2Ht5sIBksp03qcyfWMU=
github.com/KyleBanks/depth v1.2.1 h1:5h8fQADFrWtarTdtDudMmGsC7GPbOAu6RVB3ffsVFHc=
github.com/KyleBanks/depth v1.2.1/go.mod h1:jzSb9d0L43HxTQfT+oSA1EEp2q+ne2uh6XgeJcm8brE=
github.com/PuerkitoBio/purell v1.1.1 h1:WEQqlqaGbrPkxLJWfBwQmfEAE1Z7ONdDLqrN38tNFfI=
github.com/PuerkitoBio/purell v1.1.1/go.mod h1:c11w/QuzBsJSee3cPx9rAFu61PvFxuPbtSwDGJws/X0=
github.com/PuerkitoBio/urlesc v0.0.0-20170810143723-de5bf2ad4578 h1:d+Bc7a5rLufV/sSk/8dngufqelfh6jnri85riMAaF/M=
github.com/PuerkitoBio/urlesc v0.0.0-20170810143723-de5bf2ad4578/go.mod h1:uGdkoq3SwY9Y+13GIhn11/XLaGBb4BfwItxLd5jeuXE=
github.com/alecthomas/template v0.0.0-20190718012654-fb15b899a751/go.mod h1:LOuyumcjzFXgccqObfd/Ljyb9UuFJ6TxHnclSeseNhc=
github.com/cpuguy83/go-md2man/v2 v2.0.0-20190314233015-f79a8a8ca69d h1:U+s90UTSYgptZMwQh2aRr3LuazLJIa+Pg3Kc1ylSYVY=
github.com/cpuguy83/go-md2man/v2 v2.0.0-20190314233015-f79a8a8ca69d/go.mod h1:maD7wRr/U5Z6m/iR4s+kqSMx2CaBsrgA7czyZG/E6dU=
github.com/creack/pty v1.1.9/go.mod h1:oKZEueFk5CKHvIhNR5MUki03XCEU+Q6VDXinZuGJ33E=
github.com/davecgh/go-spew v1.1.0/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/davecgh/go-spew v1.1.1/go.mod h1:J7Y8YcW2NihsgmVo/mv3lAwl/skON4iLHjSsI+c5H38=
github.com/dgrijalva/jwt-go v3.2.0+incompatible h1:7qlOGliEKZXTDg6OTjfoBKDXWrumCAMpl/TFQ4/5kLM=
github.com/dgrijalva/jwt-go v3.2.0+incompatible/go.mod h1:E3ru+11k8xSBh+hMPgOLZmtrrCbhqsmaPHjLKYnJCaQ=
github.com/ghodss/yaml v1.0.0 h1:wQHKEahhL6wmXdzwWG11gIVCkOv05bNOh+Rxn0yngAk=
github.com/ghodss/yaml v1.0.0/go.mod h1:4dBDuWmgqj2HViK6kFavaiC9ZROes6MMH2rRYeMEF04=
github.com/go-openapi/jsonpointer v0.19.3/go.mod h1:Pl9vOtqEWErmShwVjC8pYs9cog34VGT37dQOVbmoatg=
github.com/go-openapi/jsonpointer v0.19.5 h1:gZr+CIYByUqjcgeLXnQu2gHYQC9o73G2XUeOFYEICuY=
github.com/go-openapi/jsonpointer v0.19.5/go.mod h1:Pl9vOtqEWErmShwVjC8pYs9cog34VGT37dQOVbmoatg=
github.com/go-openapi/jsonreference v0.19.4/go.mod h1:RdybgQwPxbL4UEjuAruzK1x3nE69AqPYEJeo/TWfEeg=
github.com/go-openapi/jsonreference v0.19.5 h1:1WJP/wi4OjB4iV8KVbH73rQaoialJrqv8gitZLxGLtM=
github.com/go-openapi/jsonreference v0.19.5/go.mod h1:RdybgQwPxbL4UEjuAruzK1x3nE69AqPYEJeo/TWfEeg=
github.com/go-openapi/spec v0.19.14/go.mod h1:gwrgJS15eCUgjLpMjBJmbZezCsw88LmgeEip0M63doA=
github.com/go-openapi/spec v0.20.0 h1:HGLc8AJ7ynOxwv0Lq4TsnwLsWMawHAYiJIFzbcML86I=
github.com/go-openapi/spec v0.20.0/go.mod h1:+81FIL1JwC5P3/Iuuozq3pPE9dXdIEGxFutcFKaVbmU=
github.com/go-openapi/spec v0.20.3 h1:uH9RQ6vdyPSs2pSy9fL8QPspDF2AMIMPtmK5coSSjtQ=
github.com/go-openapi/spec v0.20.3/go.mod h1:gG4F8wdEDN+YPBMVnzE85Rbhf+Th2DTvA9nFPQ5AYEg=
github.com/go-openapi/swag v0.19.5/go.mod h1:POnQmlKehdgb5mhVOsnJFsivZCEZ/vjK9gh66Z9tfKk=
github.com/go-openapi/swag v0.19.11/go.mod h1:Uc0gKkdR+ojzsEpjh39QChyu92vPgIr72POcgHMAgSY=
github.com/go-openapi/swag v0.19.12 h1:Bc0bnY2c3AoF7Gc+IMIAQQsD8fLHjHpc19wXvYuayQI=
github.com/go-openapi/swag v0.19.12/go.mod h1:eFdyEBkTdoAf/9RXBvj4cr1nH7GD8Kzo5HTt47gr72M=
github.com/go-openapi/swag v0.19.14 h1:gm3vOOXfiuw5i9p5N9xJvfjvuofpyvLA9Wr6QfK5Fng=
github.com/go-openapi/swag v0.19.14/go.mod h1:QYRuS/SOXUCsnplDa677K7+DxSOj6IPNl/eQntq43wQ=
github.com/gofrs/uuid v4.0.0+incompatible/go.mod h1:b2aQJv3Z4Fp6yNu3cdSllBxTCLRxnplIgP/c0N/04lM=
github.com/josharian/intern v1.0.0 h1:vlS4z54oSdjm0bgjRigI+G1HpF+tI+9rE5LLzOg8HmY=
github.com/josharian/intern v1.0.0/go.mod h1:5DoeVV0s6jJacbCEi61lwdGj/aVlrQvzHFFd8Hwg//Y=
github.com/kr/pretty v0.1.0/go.mod h1:dAy3ld7l9f0ibDNOQOHHMYYIIbhfbHSm3C4ZsoJORNo=
github.com/kr/pty v1.1.1/go.mod h1:pFQYn66WHrOpPYNljwOMqo10TkYh1fy3cYio2l3bCsQ=
github.com/kr/text v0.1.0/go.mod h1:4Jbv+DJW3UT/LiOwJeYQe1efqtUx/iVham/4vfdArNI=
github.com/kr/text v0.2.0/go.mod h1:eLer722TekiGuMkidMxC/pM04lWEeraHUUmBw8l2grE=
github.com/labstack/echo/v4 v4.0.0/go.mod h1:tZv7nai5buKSg5h/8E6zz4LsD/Dqh9/91Mvs7Z5Zyno=
github.com/labstack/echo/v4 v4.2.0 h1:jkCSsjXmBmapVXF6U4BrSz/cgofWM0CU3Q74wQvXkIc=
github.com/labstack/echo/v4 v4.2.0/go.mod h1:AA49e0DZ8kk5jTOOCKNuPR6oTnBS0dYiM4FW1e6jwpg=
github.com/labstack/gommon v0.2.8/go.mod h1:/tj9csK2iPSBvn+3NLM9e52usepMtrd5ilFYA+wQNJ4=
github.com/labstack/gommon v0.3.0 h1:JEeO0bvc78PKdyHxloTKiF8BD5iGrH8T6MSeGvSgob0=
github.com/labstack/gommon v0.3.0/go.mod h1:MULnywXg0yavhxWKc+lOruYdAhDwPK9wf0OL7NoOu+k=
github.com/mailru/easyjson v0.0.0-20190614124828-94de47d64c63/go.mod h1:C1wdFJiN94OJF2b5HbByQZoLdCWB1Yqtg26g4irojpc=
github.com/mailru/easyjson v0.0.0-20190626092158-b2ccc519800e/go.mod h1:C1wdFJiN94OJF2b5HbByQZoLdCWB1Yqtg26g4irojpc=
github.com/mailru/easyjson v0.7.6 h1:8yTIVnZgCoiM1TgqoeTl+LfU5Jg6/xL3QhGQnimLYnA=
github.com/mailru/easyjson v0.7.6/go.mod h1:xzfreul335JAWq5oZzymOObrkdz5UnU4kGfJJLY9Nlc=
github.com/mattn/go-colorable v0.0.9/go.mod h1:9vuHe8Xs5qXnSaW/c/ABM9alt+Vo+STaOChaDxuIBZU=
github.com/mattn/go-colorable v0.1.0/go.mod h1:9vuHe8Xs5qXnSaW/c/ABM9alt+Vo+STaOChaDxuIBZU=
github.com/mattn/go-colorable v0.1.2/go.mod h1:U0ppj6V5qS13XJ6of8GYAs25YV2eR4EVcfRqFIhoBtE=
github.com/mattn/go-colorable v0.1.7 h1:bQGKb3vps/j0E9GfJQ03JyhRuxsvdAanXlT9BTw3mdw=
github.com/mattn/go-colorable v0.1.7/go.mod h1:u6P/XSegPjTcexA+o6vUJrdnUu04hMope9wVRipJSqc=
github.com/mattn/go-isatty v0.0.4/go.mod h1:M+lRXTBqGeGNdLjl/ufCoiOlB5xdOkqRJdNxMWT7Zi4=
github.com/mattn/go-isatty v0.0.8/go.mod h1:Iq45c/XA43vh69/j3iqttzPXn0bhXyGjM0Hdxcsrc5s=
github.com/mattn/go-isatty v0.0.9/go.mod h1:YNRxwqDuOph6SZLI9vUUz6OYw3QyUt7WiY2yME+cCiQ=
github.com/mattn/go-isatty v0.0.12 h1:wuysRhFDzyxgEmMf5xjvJ2M9dZoWAXNNr5LSBS7uHXY=
github.com/mattn/go-isatty v0.0.12/go.mod h1:cbi8OIDigv2wuxKPP5vlRcQ1OAZbq2CE4Kysco4FUpU=
github.com/niemeyer/pretty v0.0.0-20200227124842-a10e7caefd8e/go.mod h1:zD1mROLANZcx1PVRCS0qkT7pwLkGfwJo4zjcN/Tysno=
github.com/pmezard/go-difflib v1.0.0/go.mod h1:iKH77koFhYxTK1pcRnkKkqfTogsbg7gZNVY4sRDYZ/4=
github.com/russross/blackfriday/v2 v2.0.1 h1:lPqVAte+HuHNfhJ/0LC98ESWRz8afy9tM/0RK8m9o+Q=
github.com/russross/blackfriday/v2 v2.0.1/go.mod h1:+Rmxgy9KzJVeS9/2gXHxylqXiyQDYRxCVz55jmeOWTM=
github.com/shopspring/decimal v1.2.0/go.mod h1:DKyhrW/HYNuLGql+MJL6WCR6knT2jwCFRcu2hWCYk4o=
github.com/shurcooL/sanitized_anchor_name v1.0.0 h1:PdmoCO6wvbs+7yrJyMORt4/BmY5IYyJwS/kOiWx8mHo=
github.com/shurcooL/sanitized_anchor_name v1.0.0/go.mod h1:1NzhyTcUVG4SuEtjjoZeVRXNmyL/1OwPU0+IJeTBvfc=
github.com/stretchr/objx v0.1.0/go.mod h1:HFkY916IF+rwdDfMAkV7OtwuqBVzrE8GR6GFx+wExME=
github.com/stretchr/testify v1.3.0/go.mod h1:M5WIy9Dh21IEIfnGCwXGc5bZfKNJtfHm1UVUgZn+9EI=
github.com/stretchr/testify v1.4.0/go.mod h1:j7eGeouHqKxXV5pUuKE4zz7dFj8WfuZ+81PSLYec5m4=
github.com/stretchr/testify v1.6.1/go.mod h1:6Fq8oRcR53rry900zMqJjRRixrwX3KX962/h/Wwjteg=
github.com/stretchr/testify v1.7.0/go.mod h1:6Fq8oRcR53rry900zMqJjRRixrwX3KX962/h/Wwjteg=
github.com/swaggo/echo-swagger v1.1.4 h1:uC5s/ynSwl0iJZTOMfSUGwHPRr0jLChMxb1YRMMWjfk=
github.com/swaggo/echo-swagger v1.1.4/go.mod h1:JaipWDPqOBMwM40W6qz0o07lnPOxrhDkpjA2OaqfzL8=
github.com/swaggo/files v0.0.0-20190704085106-630677cd5c14 h1:PyYN9JH5jY9j6av01SpfRMb+1DWg/i3MbGOKPxJ2wjM=
github.com/swaggo/files v0.0.0-20190704085106-630677cd5c14/go.mod h1:gxQT6pBGRuIGunNf/+tSOB5OHvguWi8Tbt82WOkf35E=
github.com/swaggo/swag v1.7.0 h1:5bCA/MTLQoIqDXXyHfOpMeDvL9j68OY/udlK4pQoo4E=
github.com/swaggo/swag v1.7.0/go.mod h1:BdPIL73gvS9NBsdi7M1JOxLvlbfvNRaBP8m6WT6Aajo=
github.com/swaggo/swag v1.7.4 h1:up+ixy8yOqJKiFcuhMgkuYuF4xnevuhnFAXXF8OSfNg=
github.com/swaggo/swag v1.7.4/go.mod h1:zD8h6h4SPv7t3l+4BKdRquqW1ASWjKZgT6Qv9z3kNqI=
github.com/urfave/cli/v2 v2.3.0 h1:qph92Y649prgesehzOrQjdWyxFOp/QVM+6imKHad91M=
github.com/urfave/cli/v2 v2.3.0/go.mod h1:LJmUH05zAU44vOAcrfzZQKsZbVcdbOG8rtL3/XcUArI=
github.com/valyala/bytebufferpool v1.0.0 h1:GqA5TC/0021Y/b9FG4Oi9Mr3q7XYx6KllzawFIhcdPw=
github.com/valyala/bytebufferpool v1.0.0/go.mod h1:6bBcMArwyJ5K/AmCkWv1jt77kVWyCJ6HpOuEn7z0Csc=
github.com/valyala/fasttemplate v0.0.0-20170224212429-dcecefd839c4/go.mod h1:50wTf68f99/Zt14pr046Tgt3Lp2vLyFZKzbFXTOabXw=
github.com/valyala/fasttemplate v1.0.1/go.mod h1:UQGH1tvbgY+Nz5t2n7tXsz52dQxojPUpymEIMZ47gx8=
github.com/valyala/fasttemplate v1.2.1 h1:TVEnxayobAdVkhQfrfes2IzOB6o+z4roRkPF52WA1u4=
github.com/valyala/fasttemplate v1.2.1/go.mod h1:KHLXt3tVN2HBp8eijSv/kGJopbvo7S+qRAEEKiv+SiQ=
github.com/yuin/goldmark v1.2.1/go.mod h1:3hX8gzYuyVAZsxl0MRgGTJEmQBFcNTphYh9decYSb74=
golang.org/x/crypto v0.0.0-20190130090550-b01c7a725664/go.mod h1:6SG95UA2DQfeDnfUPMdvaQW0Q7yPrPDi9nlGo2tz2b4=
golang.org/x/crypto v0.0.0-20190308221718-c2843e01d9a2/go.mod h1:djNgcEr1/C05ACkg1iLfiJU5Ep61QUkGW8qpdssI0+w=
golang.org/x/crypto v0.0.0-20191011191535-87dc89f01550/go.mod h1:yigFU9vqHzYiE8UmvKecakEJjdnWj3jj499lnFckfCI=
golang.org/x/crypto v0.0.0-20200622213623-75b288015ac9/go.mod h1:LzIPMQfyMNhhGPhUkYOs5KpL4U8rLKemX1yGLhDgUto=
golang.org/x/crypto v0.0.0-20200820211705-5c72a883971a h1:vclmkQCjlDX5OydZ9wv8rBCcS0QyQY66Mpf/7BZbInM=
golang.org/x/crypto v0.0.0-20200820211705-5c72a883971a/go.mod h1:LzIPMQfyMNhhGPhUkYOs5KpL4U8rLKemX1yGLhDgUto=
golang.org/x/mod v0.3.0/go.mod h1:s0Qsj1ACt9ePp/hMypM3fl4fZqREWJwdYDEqhRiZZUA=
golang.org/x/net v0.0.0-20190404232315-eb5bcb51f2a3/go.mod h1:t9HGtf8HONx5eT2rtn7q6eTqICYqUVnKs3thJo3Qplg=
golang.org/x/net v0.0.0-20190620200207-3b0461eec859/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20190827160401-ba9fcec4b297/go.mod h1:z5CRVTTTmAJ677TzLLGU+0bjPO0LkuOLi4/5GtJWs/s=
golang.org/x/net v0.0.0-20200822124328-c89045814202 h1:VvcQYSHwXgi7W+TpUR6A9g6Up98WAHf3f/ulnJ62IyA=
golang.org/x/net v0.0.0-20200822124328-c89045814202/go.mod h1:/O7V0waA8r7cgGh81Ro3o1hOxt32SMVPicZroKQ2sZA=
golang.org/x/net v0.0.0-20201021035429-f5854403a974/go.mod h1:sp8m0HH+o8qH0wwXwYZr8TS3Oi6o0r6Gce1SSxlDquU=
golang.org/x/net v0.0.0-20201110031124-69a78807bb2b/go.mod h1:sp8m0HH+o8qH0wwXwYZr8TS3Oi6o0r6Gce1SSxlDquU=
golang.org/x/net v0.0.0-20201202161906-c7110b5ffcbb h1:eBmm0M9fYhWpKZLjQUUKka/LtIxf46G4fxeEz5KJr9U=
golang.org/x/net v0.0.0-20201202161906-c7110b5ffcbb/go.mod h1:sp8m0HH+o8qH0wwXwYZr8TS3Oi6o0r6Gce1SSxlDquU=
golang.org/x/net v0.0.0-20210119194325-5f4716e94777 h1:003p0dJM77cxMSyCPFphvZf/Y5/NXf5fzg6ufd1/Oew=
golang.org/x/net v0.0.0-20210119194325-5f4716e94777/go.mod h1:m0MpNAwzfU5UDzcl9v0D8zg8gWTRqZa9RBIspLL5mdg=
golang.org/x/sync v0.0.0-20190423024810-112230192c58/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sync v0.0.0-20201020160332-67f06af15bc9/go.mod h1:RxMgew5VJxzue5/jJTE5uejpjVlOe/izrB70Jof72aM=
golang.org/x/sys v0.0.0-20190129075346-302c3dd5f1cc/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190215142949-d0b11bdaac8a/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190222072716-a9d3bda3a223/go.mod h1:STP8DvDyc/dI5b8T5hshtkjS+E42TnysNCUPdjciGhY=
golang.org/x/sys v0.0.0-20190412213103-97732733099d/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20190813064441-fde4db37ae7a/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200116001909-b77594299b42/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200223170610-d5e6a3e2c0ae/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200323222414-85ca7c5b95cd/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200826173525-f9321e4c35a6 h1:DvY3Zkh7KabQE/kfzMvYvKirSiguP9Q/veMtkYyf0o8=
golang.org/x/sys v0.0.0-20200826173525-f9321e4c35a6/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20200930185726-fdedc70b468f h1:+Nyd8tzPX9R7BWHguqsrbFdRx3WQ/1ib8I44HXV5yTA=
golang.org/x/sys v0.0.0-20200930185726-fdedc70b468f/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20201119102817-f84b799fce68/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/sys v0.0.0-20210119212857-b64e53b001e4 h1:myAQVi0cGEoqQVR5POX+8RR2mrocKqNN1hmeMqhX27k=
golang.org/x/sys v0.0.0-20210119212857-b64e53b001e4/go.mod h1:h1NjWce9XRLGQEsW7wpKNCjG9DtNlClVuFLEZdDNbEs=
golang.org/x/term v0.0.0-20201126162022-7de9c90e9dd1/go.mod h1:bj7SfCRtBDWHUb9snDiAeCFNEtKQo2Wmx5Cou7ajbmo=
golang.org/x/text v0.3.0/go.mod h1:NqM8EUOU14njkJ3fqMW+pc6Ldnwhi/IjpwHt7yyuwOQ=
golang.org/x/text v0.3.3 h1:cokOdA+Jmi5PJGXLlLllQSgYigAEfHXJAERHVMaCc2k=
golang.org/x/text v0.3.3/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.4 h1:0YWbFKbhXG/wIiuHDSKpS0Iy7FSA+u45VtBMfQcFTTc=
golang.org/x/text v0.3.4/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/text v0.3.5 h1:i6eZZ+zk0SOf0xgBpEpPD18qWcJda6q1sxt3S0kzyUQ=
golang.org/x/text v0.3.5/go.mod h1:5Zoc/QRtKVWzQhOtBMvqHzDpF6irO9z98xDceosuGiQ=
golang.org/x/time v0.0.0-20201208040808-7e3f01d25324 h1:Hir2P/De0WpUhtrKGGjvSb2YxUgyZ7EFOSLIcSSpiwE=
golang.org/x/time v0.0.0-20201208040808-7e3f01d25324/go.mod h1:tRJNPiyCQ0inRvYxbN9jk5I+vvW/OXSQhTDSoE431IQ=
golang.org/x/tools v0.0.0-20180917221912-90fa682c2a6e/go.mod h1:n7NCudcB/nEzxVGmLbDWY5pfWTLqBcC2KZ6jyYvM4mQ=
golang.org/x/tools v0.0.0-20191119224855-298f0cb1881e/go.mod h1:b+2E5dAYhXwXZwtnZ6UAqBI28+e2cm9otk0dWdXHAEo=
golang.org/x/tools v0.0.0-20201120155355-20be4ac4bd6e/go.mod h1:emZCQorbCU4vsT4fOWvOPXz4eW1wZW4PmDk9uLelYpA=
golang.org/x/tools v0.0.0-20201207182000-5679438983bd h1:aZYo+3GGTb9Pya0Di6t7G0JOwKGb782xQAJlZyVcwII=
golang.org/x/tools v0.0.0-20201207182000-5679438983bd/go.mod h1:emZCQorbCU4vsT4fOWvOPXz4eW1wZW4PmDk9uLelYpA=
golang.org/x/tools v0.1.0 h1:po9/4sTYwZU9lPhi1tOrb4hCv3qrhiQ77LZfGa2OjwY=
golang.org/x/tools v0.1.0/go.mod h1:xkSsbof2nBLbhDlRMhhhyNLN/zl3eTqcnHD5viDpcZ0=
golang.org/x/xerrors v0.0.0-20190717185122-a985d3407aa7/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20191011141410-1b5146add898/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1/go.mod h1:I/5z698sn9Ka8TeJc9MKroUUfqBBauWjQqLJ2OPfmY0=
gopkg.in/check.v1 v0.0.0-20161208181325-20d25e280405/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/check.v1 v1.0.0-20200227125254-8fa46927fb4f/go.mod h1:Co6ibVJAznAaIkqp8huTwlJQCZ016jof/cbN4VW5Yz0=
gopkg.in/yaml.v2 v2.2.2/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.2.3/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.3.0/go.mod h1:hI93XBmqTisBFMUTm0b8Fm+jr3Dg1NNxqwp+5A1VGuI=
gopkg.in/yaml.v2 v2.4.0 h1:D8xgwECY7CYvx+Y2n4sBz93Jn9JRvxdiyyo8CTfuKaY=
gopkg.in/yaml.v2 v2.4.0/go.mod h1:RDklbk79AGWmwhnvt/jBztapEOGDOx6ZbXqjP6csGnQ=
gopkg.in/yaml.v3 v3.0.0-20200313102051-9f266ea9e77c/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=
gopkg.in/yaml.v3 v3.0.0-20200615113413-eeeca48fe776/go.mod h1:K4uyk7z7BCEPqu6E+C64Yfv1cQ7kz7rIZviUmN+EgEM=        
`;
        writeFileSync(this.options.output + '/go.sum', sum);
        const dockerfile = `FROM golang:1.17-alpine
WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY *.go ./
RUN swag init
RUN go build -o /restapi
CMD [ "/restapi" ]
`;
        writeFileSync(this.options.output + '/Dockerfile', dockerfile);
        const mainFileContent = `package main
import (
    "github.com/labstack/echo/v4"
    "github.com/labstack/echo/v4/middleware"
    "github.com/swaggo/echo-swagger"
    "strings"
	"fmt"
    _ "${this.options.namepsace}/docs"
    controllers "${this.options.namepsace}/controllers"
)

// @title Echo Swagger Example API
// @version 1.0
// @description This is a sample server server.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:3000
// @BasePath /
// @schemes http
func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
    e.Use(middleware.CORS())
    e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Skipper: func(c echo.Context) bool {
			if strings.Contains(c.Request().URL.Path, "swagger") {
				return true
			}
			return false
		},
	}))

    // Controllers
${this.controllersNames.map(x => `\tcontrollers.${this.getControllerName(x)}(e)`).join('\n')}

	// Start server
    e.GET("/swagger/*", echoSwagger.WrapHandler)
    fmt.Printf("http://localhost:3000/swagger/index.html")
	e.Logger.Fatal(e.Start(":3000"))
}
`;
        writeFileSync(this.mainExportFile, mainFileContent);
    }
    generateController(controller: string, controlerPaths: ApiPath[]): void {
        const controllerName = this.getControllerName(controller);
        makeDirIfNotExist(this.controllersFolder);
        const definisions = [] as { func: string; route: string }[];
        for (const controllerPath of controlerPaths) {
            console.log(`\t${controllerPath.method} - ${controllerPath.path}`);
            definisions.push(this.generateControllerMethodContent(controller, controllerPath));
        }
        const controllerContent = `package controllers
import (
    "github.com/labstack/echo/v4"
	"errors"${this.haveModels ? `\n\tmodels "${this.options.namepsace}/models"` : ''}
)
${this.haveModels ? `\nvar _ = models.${this.getFileName([...this.allEnumsEditorInput, ...this.allObjectEditorInputs][0])}` : ''}

${definisions.map(x => x.func).join('\n')}

func ${controllerName}(e *echo.Echo) {
${definisions.map(x => '\t' + x.route).join('\n')}
}`;
        const controllerFile = join(this.controllersFolder, controllerName + this.getFileExtension(false));
        writeFileSync(controllerFile, '\n' + controllerContent);
    }
    generateControllerMethodContent(controller: string, controllerPath: ApiPath): any {
        const methodName = capitalize(this.getMethodName(controllerPath));
        let requestType = controllerPath.body.haveBody ? this.getPropDesc(controllerPath.body.schema, 'models') : 'object';
        const responseType = this.getPropDesc(controllerPath.response, 'models');
        const headers = [...controllerPath.cookieParams, ...controllerPath.headerParams];
        const headerVarbs = (headers || []).map(x => `\t// h${capitalize(x.name)} := c.request.Header.Get("${x.name}")`).join('\n');
        const pathVarbs = (controllerPath.pathParams || []).map(x => `\t// p${capitalize(x.name)} := c.Param("${x.name}")`).join('\n');
        const queryVarbs = (controllerPath.queryParams || []).map(x => `\t// q${capitalize(x.name)} := c.QueryParam("${x.name}")`).join('\n');
        const bodyVarb = controllerPath.body.haveBody
            ? `\treqBody := new(${requestType})
    if err := c.Bind(reqBody); err != nil {
        return echo.NewHTTPError(401, err.Error())
    }`
            : '';
        const varbs = [headerVarbs, pathVarbs, queryVarbs, bodyVarb].filter(x => x.trim()).join('\n');
        let func = `// ${methodName} godoc
// @Tags ${controller}
// @Accept */*
// @Produce json
// @Success 200 {object} ${responseType}
// @Router ${controllerPath.path} [${controllerPath.method.toUpperCase()}]
func ${methodName} (c echo.Context) error {
${varbs}
    return errors.New("not implemented")
}`.replace(/\n\n/g, '\n');
        const route = `e.${controllerPath.method.toUpperCase()}("${controllerPath.path}", ${methodName})`;
        return { func, route };
    }
}
