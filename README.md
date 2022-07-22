# PaperPlaneAnim
模拟纸飞机运动动画

fly函数
```
public fly(targetPos: cc.Vec2, cb?: () => void, circleAngle?) {
        this._targetCallBack = cb;
        targetPos = this.flyNd.parent.convertToNodeSpaceAR(targetPos);
        this._targetPos = targetPos;
        this._speed = 0;
        this._circleAngleCnt = 0;
        this._circleFactor = 0;
        this.circleAngle = circleAngle == null ? this.circleAngle : circleAngle;
        this._flyStatus = FlyStatus.AccCircle;
}
```
传入飞机的目的地位置`targetPos`

update里根据飞机的位置`this.flyNd.position`和`targetPos`计算得到夹角`this._targetAngle`

```
//计算目标位置在飞机的方位。

let radian = Math.atan2(this.flyNd.y - this._targetPos.y, this.flyNd.x - this._targetPos.x);
this._targetAngle = 180 / Math.PI * radian;
this._targetAngle = (360 + this._targetAngle) % 360;
```
计算飞机当前角度 `curAngle` 并计算`curAngle`与`this._targetAngle`的差`diffAngle`

```
let curAngle = (360 + (this.flyNd.angle + this.defaultPlaneAngleOffset) % 360) % 360;
let diffAngle = this._targetAngle - curAngle;
```

修改飞机的角度
```
            if (Math.abs(diffAngle) > 1) {
                let factorAngle = this._targetAngle - curAngle > 0 ? 1 : -1;
                if (Math.abs(this._targetAngle - curAngle) > 180) {
                    factorAngle *= -1;
                }
                this.flyNd.angle += factorAngle * this.angularSpeed;
            }
```

飞机总是向着飞机头的方向前进，根据飞机角度`curAngle`计算飞机x y上的速度分量因素`factor`

```
	let factor = this._getDirection(curAngle);
    private _getDirection(curAngle: number): cc.Vec2 {
        let factorX = 0;
        let factorY = 0;
        if (curAngle > 90 && curAngle < 270) {
            let deacc = (90 - (Math.abs(180 - curAngle))) / 90;
            factorX = 1 * deacc;
        } else if (curAngle < 90 || curAngle > 270) {
            let deacc = 1;
            if (curAngle < 90) {
                deacc = (90 - curAngle) / 90
            } else if (curAngle > 270) {
                deacc = (90 - (360 - curAngle)) / 90
            }
            factorX = -1 * deacc;
        }
        if (curAngle > 180) {
            let deacc = (90 - (Math.abs(270 - curAngle))) / 90;
            factorY = 1 * deacc;
        } else if (curAngle < 180) {
            let deacc = (90 - (Math.abs(90 - curAngle))) / 90;
            factorY = -1 * deacc;
        }
        return cc.v2(factorX, factorY);
    }
```

根据`factor`修改飞机位置
```
            //加速
            this._speed = cc.misc.clampf(this._speed - this.acc, this.speed * 0.9, this.speed*1.5);
            //移动pos
            this.flyNd.x += factor.x * this._speed;
            this.flyNd.y += factor.y * this._speed;
```

最后达到目的地判断
```
            //判断到达
            let distance = Math.abs(this.flyNd.getPosition().sub(this._targetPos).mag());
            if (distance <= 15) {
                this._flyStatus = FlyStatus.Idle;
                if (this._targetCallBack! = null) {
                    this._targetCallBack();
                    this._targetCallBack = null;
                }
            }
```

最终效果就是飞机先转一圈，让后朝着目的地前进
