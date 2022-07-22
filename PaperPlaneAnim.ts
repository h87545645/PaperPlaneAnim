

const { ccclass, property } = cc._decorator;

enum FlyStatus {
    Idle = 0,
    TargetMoving = 1,
    AccCircle = 2 //加速
}

@ccclass
export default class PaperPlaneAnim extends cc.Component {

    @property(cc.Node)
    flyNd: cc.Node = null;

    @property({
        tooltip: "定义9点方向为初始方向, 逆时针方向为正 飞机图片在angle为0时,飞机头和初始方向的角度偏差."
    })
    defaultPlaneAngleOffset: number = 0;

    @property({
        tooltip: "飞到目的地过程中要做转圈表演的角度."
    })
    circleAngle: number = 0;

    @property({
        tooltip: "飞行速度."
    })
    speed: number = 12;

    @property({
        tooltip: "掉头角速度."
    })
    angularSpeed: number = 6;


    @property({
        tooltip: "加速度."
    })
    acc: number = 0.15;

    private _flyStatus: FlyStatus = FlyStatus.Idle;

    private _targetAngle: number = 0; //飞机到目标的最终角度

    private _targetPos: cc.Vec2 = cc.v2(0, 0);

    private _targetCallBack: Function = null;

    private _circleAngleCnt: number = 0;

    private _speed: number = 0;

    private _circleFactor: number = 0;



    // LIFE-CYCLE CALLBACKS:

    start() {
        //test
        // let canvas = cc.find("Canvas/testnod");
        // canvas.on(cc.Node.EventType.TOUCH_END, (t) => {
        //     let pos = t.touch._point;
        //     this.fly(pos);
        // }, this);
    }

    lateUpdate(dt) {
        //模拟飞机只能像飞机头朝向前进，到达目的地的方式就是不断修改飞机头朝向。
        if (this._flyStatus == FlyStatus.TargetMoving) {
            //计算目标位置在飞机的方位。
            let radian = Math.atan2(this.flyNd.y - this._targetPos.y, this.flyNd.x - this._targetPos.x);
            this._targetAngle = 180 / Math.PI * radian;
            this._targetAngle = (360 + this._targetAngle) % 360;

            //判断飞机头在哪个象限
            let curAngle = (360 + (this.flyNd.angle + this.defaultPlaneAngleOffset) % 360) % 360;
            let factor = this._getDirection(curAngle);
            //修改angle
            let diffAngle = this._targetAngle - curAngle;
            if (Math.abs(diffAngle) > 1) {
                let factorAngle = this._targetAngle - curAngle > 0 ? 1 : -1;
                if (Math.abs(this._targetAngle - curAngle) > 180) {
                    factorAngle *= -1;
                }
                this.flyNd.angle += factorAngle * this.angularSpeed;
            }
            //加速
            this._speed = cc.misc.clampf(this._speed - this.acc, this.speed * 0.9, this.speed*1.5);
            //移动pos
            this.flyNd.x += factor.x * this._speed;
            this.flyNd.y += factor.y * this._speed;

            //判断到达
            let distance = Math.abs(this.flyNd.getPosition().sub(this._targetPos).mag());
            if (distance <= 15) {
                this._flyStatus = FlyStatus.Idle;
                if (this._targetCallBack! = null) {
                    this._targetCallBack();
                    this._targetCallBack = null;
                }
            }

        } else if (this._flyStatus == FlyStatus.AccCircle) {
            //转圈表演
            if (this._circleAngleCnt >= this.circleAngle) {
                this._flyStatus = FlyStatus.TargetMoving;
            }
            let curAngle = (360 + (this.flyNd.angle + this.defaultPlaneAngleOffset) % 360) % 360;
            let factor = this._getDirection(curAngle);
            if (this._speed > this.speed * 0.3) {

                if (this._circleFactor == 0) {
                    this._circleFactor = this._targetAngle - curAngle > 0 ? 1 : -1;
                    if (Math.abs(this._targetAngle - curAngle) > 180) {
                        this._circleFactor *= -1;
                    }
                }
                this.flyNd.angle += this._circleFactor * this.angularSpeed;
                this._circleAngleCnt += this.angularSpeed;
            }

            //加速
            this._speed = cc.misc.clampf(this._speed + this.acc, this.speed * 0.2, this.speed*1.5);
            //移动pos
            this.flyNd.x += factor.x * this._speed;
            this.flyNd.y += factor.y * this._speed;
        }
    }

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
}
