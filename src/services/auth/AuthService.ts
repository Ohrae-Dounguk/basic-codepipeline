import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { hex } from "../../utils/Bcrypt";
import Axios from "axios";

@Service()
export class AuthService {
    constructor(
        // @InjectRepository() private shopRepo: ShopRepository,
    ) {}

    /**
     * 점포 유효성 체크
     * @param loginShop
     */
    // public async validateShop(loginShop: IShopLogin): Promise<IShopResponse> {
    //     const shop = await this.shopRepo.findOne({
    //         select: ["id", "password", "username", "profile_key", "shop_id"],
    //         where: {
    //             username: loginShop.id,
    //         },
    //     });

    //     if (shop) {
    //         const isPasswordMatch = await shop.comparePassword(
    //             loginShop.password,
    //         );

    //         if (isPasswordMatch) {
    //             return {
    //                 id: shop.id,
    //                 profile_key: shop.profile_key,
    //             };
    //         }
    //     }

    //     return null;
    // }
}
