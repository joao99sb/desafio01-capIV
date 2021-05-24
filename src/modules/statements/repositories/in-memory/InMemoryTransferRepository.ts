import { Transfer } from "../../entities/Transfer";
import { ICreateTransferDTO } from "../../useCases/createTransfer/ICreateTransferDTO";
import { ITransferRepository } from "../ITransferRepository";

class InMemoryTransferRepository implements ITransferRepository {
  private repository: Transfer[] = []

  async create({ recipient_id, sender_id }: ICreateTransferDTO): Promise<Transfer> {
    const transfer = new Transfer();

    Object.assign(transfer, {
      recipient_id,
      sender_id
    });

    this.repository.push(transfer);
    return transfer;
  }
}

export { InMemoryTransferRepository }
